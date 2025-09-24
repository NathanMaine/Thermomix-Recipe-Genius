"use client";
import { useState } from "react";
import type { Recipe } from "@thermo/schema";

const SERVER = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:7070";

export default function Home() {
  const [token, setToken] = useState<string>("");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [recipe, setRecipe] = useState<Recipe>({
    title: "Garlic Butter Broccoli",
    description: "Simple side in TM6",
    servings: 2,
    total_time_min: 10,
    ingredients: [
      { name: "Broccoli florets", amount_g: 300 },
      { name: "Butter", amount_g: 30 },
      { name: "Salt", amount_g: 3 }
    ],
    steps: [
      { text: "Weigh broccoli", mode: "Weigh" },
      { text: "Steam 8 min Varoma", temperature_c: 100, time_s: 480, mode: "Heat" },
      { text: "Mix butter 20s speed 3", time_s: 20, speed: 3, mode: "Blend" }
    ],
    tags: ["side", "vegetables"]
  });

  async function doLogin() {
    const r = await fetch(`${SERVER}/login`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ email, password }) });
    const json = await r.json();
    if (json?.token) setToken(json.token);
  }

  async function saveToCookidoo() {
    if (!token) return alert("Login first");
    const r = await fetch(`${SERVER}/cookidoo/created-recipes`, { method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify({ token, recipe }) });
    const json = await r.json();
    if (json.status === "ok") {
      window.open(json.cookidooUrl, "_blank");
    } else {
      alert("Failed to upload");
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Thermomix Recipe Genius</h1>

      <section className="border p-4 rounded-xl">
        <h2 className="font-semibold mb-2">Cookidoo Login (server-side)</h2>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border p-2 w-full"
          />
          <button
            onClick={doLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Login
          </button>
          {token && <p className="text-green-600">Session OK.</p>}
        </div>
      </section>

      <section className="border p-4 rounded-xl">
        <h2 className="font-semibold mb-2">Recipe Preview</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {JSON.stringify(recipe, null, 2)}
        </pre>
      </section>

      <section className="border p-4 rounded-xl">
        <h2 className="font-semibold mb-2">Save to Cookidoo</h2>
        <button
          onClick={saveToCookidoo}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save to Cookidoo
        </button>
      </section>
    </main>
  );
}