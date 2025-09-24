from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import os, jwt, time, re
from typing import Optional, Literal, Union, Dict, List

app = FastAPI(title="Thermomix Companion Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")
REGION = os.getenv("COOKIDOO_REGION", "us")
MOCK = os.getenv("COOKIDOO_MOCK", "1") == "1"   # mock mode on by default for e2e

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

# ----- Auth (demo JWT) -----
class LoginReq(BaseModel):
    email: str
    password: str

@app.post("/login")
def login(req: LoginReq):
    # TODO: perform real Cookidoo login (unofficial client) and store session
    token = jwt.encode({"sub": req.email, "exp": int(time.time()) + 3600}, JWT_SECRET, algorithm="HS256")
    return {"token": token, "region": REGION, "mock": MOCK}

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

    # ----- REAL IMPLEMENTATION (replace with unofficial client) -----
    # client = CookidooClient(...)
    # recipe_id = client.create_created_recipe(payload)
    # return { "status": "ok", "mock": False, "cookidooUrl": client.created_recipes_url(), "id": recipe_id }
    return {"status": "ok", "mock": False, "cookidooUrl": f"https://cookidoo.{REGION}/profile/recipes/created"}

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