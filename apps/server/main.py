from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import os, jwt, time, re
from typing import Optional, Literal, Union, Dict, List
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '.env'))
print("Environment loaded")

app = FastAPI(title="Thermomix Companion Server")
print("FastAPI app created")

# Add CORS middleware
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # Next.js dev server
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
print("CORS middleware commented out")

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
AUTH_STRATEGY = os.getenv("AUTH_STRATEGY", "web_jwt")
COOKIDOO_HOST = os.getenv("COOKIDOO_HOST", "cookidoo.thermomix.com")
COOKIDOO_LOCALE = os.getenv("COOKIDOO_LOCALE", "en-US")
COOKIDOO_JWT = os.getenv("COOKIDOO_JWT")
REGION = os.getenv("COOKIDOO_REGION", "us")
MOCK = os.getenv("COOKIDOO_MOCK", "1") == "1"
print(f"MOCK = {MOCK}")

# ----- Cookidoo API Client -----
class CookidooClient:
    def __init__(self, jwt_token: str, host: str = "cookidoo.thermomix.com", locale: str = "en-US"):
        self.jwt_token = jwt_token
        self.host = host
        self.locale = locale
        self.base_url = f"https://{host}"
        self.session = requests.Session()

        # Configure retry strategy
        retry_strategy = Retry(
            total=3,
            status_forcelist=[429, 500, 502, 503, 504],
            backoff_factor=1
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)

        # Headers to mimic browser with JWT authentication
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': f'{locale},en;q=0.9',
            'Content-Type': 'application/json',
            'Origin': self.base_url,
            'Referer': f"{self.base_url}/",
            'Authorization': f'Bearer {jwt_token}',
            'Cookie': f'_oauth2_proxy={jwt_token}',
        })

    def create_created_recipe(self, recipe_payload: dict) -> Optional[str]:
        """Create a new recipe in Cookidoo"""
        # Try different possible API endpoints for recipe creation
        create_urls = [
            f"{self.base_url}/api/recipes/created",
            f"{self.base_url}/api/recipes",
            f"{self.base_url}/recipes/created",
            "https://cookidoo.com/api/recipes/created",
            "https://cookidoo.com/api/recipes"
        ]
        
        for create_url in create_urls:
            try:
                print(f"Trying recipe creation URL: {create_url}")
                response = self.session.post(create_url, json=recipe_payload, timeout=15)
                print(f"Recipe creation response: {response.status_code}")
                
                if response.status_code in [200, 201]:
                    result = response.json()
                    recipe_id = result.get('id') or result.get('recipeId') or result.get('recipe_id')
                    
                    if recipe_id:
                        print(f"Recipe created successfully with ID: {recipe_id}")
                        return str(recipe_id)
                    else:
                        print(f"Recipe creation response: {result}")
                        # Continue trying other endpoints
                elif response.status_code == 302:
                    # Redirect might indicate success
                    location = response.headers.get('Location', '')
                    if 'recipe' in location.lower():
                        print(f"Recipe created, redirected to: {location}")
                        # Extract ID from URL if possible
                        import re
                        match = re.search(r'/recipe[s]?/(\d+)', location)
                        if match:
                            return match.group(1)
                        return "redirect-success"
                else:
                    print(f"Endpoint {create_url} failed: {response.status_code} - {response.text[:200]}")
                    
            except requests.RequestException as e:
                print(f"Recipe creation failed for {create_url}: {e}")
                continue
        
        # If all endpoints failed, raise an error
        raise Exception("All recipe creation endpoints failed")

    def created_recipes_url(self) -> str:
        """Get URL for created recipes page"""
        return f"{self.base_url}/profile/recipes/created"

# ----- In-memory store for mock mode -----
MOCK_CREATED_BY_USER: Dict[str, List[dict]] = {}

# ----- Models (schema-aligned) -----
class Ingredient(BaseModel):
    name: str
    amount_g: Optional[float] = None
    amount_ml: Optional[float] = None
    note: Optional[str] = None

    @field_validator("amount_g", "amount_ml")
    @classmethod
    def nonnegative(cls, v):
        if v is not None and v < 0:
            raise ValueError("amount must be >= 0")
        return v

class Step(BaseModel):
    text: str
    temperature_c: Optional[int] = Field(default=None)
    speed: Optional[Union[float, Literal["Turbo"]]] = Field(default=None)
    time_s: Optional[int] = Field(default=None)
    mode: Optional[Literal["Stir","Knead","Whisk","Blend","Heat","Weigh"]] = Field(default=None)
    safety: bool = False

    @field_validator("temperature_c")
    @classmethod
    def temp_bounds(cls, v):
        if v is None: return v
        if not (37 <= v <= 160):
            raise ValueError("temperature_c must be between 37 and 160 C (Thermomix range)")
        return v

    @field_validator("speed")
    @classmethod
    def speed_bounds(cls, v):
        if v is None: return v
        if v == "Turbo": return v
        if not (0 <= float(v) <= 10):
            raise ValueError("speed must be 0..10 or 'Turbo'")
        return v

    @field_validator("time_s")
    @classmethod
    def time_bounds(cls, v):
        if v is None: return v
        if v < 0: raise ValueError("time_s must be >= 0")
        return v

class Recipe(BaseModel):
    title: str = Field(min_length=2)
    description: Optional[str] = None
    servings: int = Field(default=2, ge=1, le=12)
    total_time_min: int = Field(default=0, ge=0)
    ingredients: List[Ingredient]
    steps: List[Step] = Field(min_length=1)
    tags: Optional[List[str]] = None

# ----- Auth (JWT validation) -----
class LoginReq(BaseModel):
    token: str  # JWT token from _oauth2_proxy cookie

@app.post("/login")
def login(req: LoginReq):
    # Validate the JWT token (Cookidoo uses a custom format with | separators)
    if not req.token or len(req.token.strip()) == 0:
        raise HTTPException(status_code=401, detail="Invalid token")

    # For Cookidoo JWT tokens (format: part1|part2|part3), just validate presence
    # The token is already authenticated by Cookidoo/OAuth proxy
    try:
        # Create our own session token
        session_token = jwt.encode({
            "sub": "cookidoo_user",
            "cookidoo_jwt": req.token,
            "exp": int(time.time()) + 3600
        }, JWT_SECRET, algorithm="HS256")

        return {"token": session_token, "region": REGION, "mock": MOCK}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

@app.get("/test")
def test():
    try:
        return "Hello World"
    except Exception as e:
        print(f"Error in test endpoint: {e}")
        raise

def get_user_from_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return str(payload["sub"])
    except Exception:
        raise HTTPException(status_code=401, detail="invalid token")

# ----- Stricter mapper to a plausible Created-Recipe payload -----
def normalize_text(t: str) -> str:
    return re.sub(r"\s+", " ", t).strip()

def step_to_action(s: Step) -> dict:
    action: dict = {
        "text": normalize_text(s.text),
        "safety": bool(s.safety)
    }
    if s.mode == "Weigh":
        action["type"] = "WEIGH"
    elif s.mode in {"Heat","Blend","Knead","Whisk","Stir"}:
        action["type"] = s.mode.upper()
    else:
        action["type"] = "INSTRUCTION"

    if s.temperature_c is not None:
        action["temperatureC"] = int(s.temperature_c)
    if s.speed is not None:
        action["speed"] = "Turbo" if s.speed == "Turbo" else float(s.speed)
    if s.time_s is not None:
        action["timeS"] = int(s.time_s)

    return action

def map_to_cookidoo_payload(r: Recipe) -> dict:
    ingredients = []
    for i in r.ingredients:
        ingredients.append({
            "name": normalize_text(i.name),
            "amount": {
                "g": i.amount_g if i.amount_g is not None else None,
                "ml": i.amount_ml if i.amount_ml is not None else None
            },
            "note": normalize_text(i.note) if i.note else None
        })

    steps = [step_to_action(s) for s in r.steps]

    payload = {
        "title": normalize_text(r.title),
        "description": normalize_text(r.description) if r.description else "",
        "servings": int(r.servings),
        "totalTimeMin": int(r.total_time_min),
        "ingredients": ingredients,
        "steps": steps,
        "tags": r.tags or [],
        "region": REGION,
        "language": "en"
    }
    return payload

# ----- API: Create / List Created Recipes -----
class CreateRecipeReq(BaseModel):
    token: str
    recipe: Recipe

@app.post("/cookidoo/created-recipes")
def create_created_recipe(req: CreateRecipeReq):
    user = get_user_from_token(req.token)
    payload = map_to_cookidoo_payload(req.recipe)

    if MOCK:
        MOCK_CREATED_BY_USER.setdefault(user, []).append(payload)
        return {
            "status": "ok",
            "mock": True,
            "cookidooUrl": f"https://cookidoo.{REGION}/profile/recipes/created",
            "id": len(MOCK_CREATED_BY_USER[user]) - 1
        }

    # ----- REAL IMPLEMENTATION -----
    if not COOKIDOO_JWT:
        raise HTTPException(status_code=500, detail="Cookidoo JWT not configured")

    try:
        client = CookidooClient(COOKIDOO_JWT, COOKIDOO_HOST, COOKIDOO_LOCALE)
        recipe_id = client.create_created_recipe(payload)
        return {
            "status": "ok",
            "mock": False,
            "cookidooUrl": client.created_recipes_url(),
            "id": recipe_id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create recipe: {str(e)}")

class ListReq(BaseModel):
    token: str

@app.post("/cookidoo/created-recipes/list")
def list_created(req: ListReq):
    user = get_user_from_token(req.token)
    if MOCK:
        return {"status": "ok", "mock": True, "recipes": MOCK_CREATED_BY_USER.get(user, [])}
    return {"status": "ok", "mock": False, "recipes": []}

class ShoppingReq(BaseModel):
    token: str
    items: List[str]

@app.post("/cookidoo/shopping-list")
def shopping(req: ShoppingReq):
    _ = get_user_from_token(req.token)
    return {"status": "ok", "added": [normalize_text(x) for x in req.items]}