import { test, expect, request } from "@playwright/test";

const WEB = process.env.E2E_WEB_URL || "http://localhost:3000";
const SERVER = process.env.E2E_SERVER_URL || "http://localhost:7070";
const JWT_TOKEN = process.env.E2E_COOKIDOO_JWT || "test-jwt-token";

test.describe("Created Recipe upload flow", () => {
  test("login → Save to Cookidoo → server receives payload", async ({ page }) => {
    await page.goto(WEB);

    const jwtTextarea = page.getByPlaceholder("Paste your Cookidoo JWT token here...");
    await jwtTextarea.fill(JWT_TOKEN);

    const postPromise = page.waitForResponse(resp =>
      resp.url().includes("/cookidoo/created-recipes") && resp.request().method() === "POST"
    );

    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Session OK.")).toBeVisible();

    await page.getByRole("button", { name: "Save to Cookidoo" }).click();

    const postResp = await postPromise;
    expect(postResp.ok()).toBeTruthy();

    const postJson = await postResp.json();
    expect(postJson.status).toBe("ok");

    const reqCtx = await request.newContext();
    const loginRes = await reqCtx.post(`${SERVER}/login`, {
      data: { token: JWT_TOKEN }
    });
    expect(loginRes.ok()).toBeTruthy();
    const { token } = await loginRes.json();

    const listRes = await reqCtx.post(`${SERVER}/cookidoo/created-recipes/list`, {
      data: { token }
    });
    expect(listRes.ok()).toBeTruthy();
    const listJson = await listRes.json();
    expect(listJson.status).toBe("ok");
    expect(Array.isArray(listJson.recipes)).toBeTruthy();
    expect(listJson.recipes.length).toBeGreaterThan(0);

    const last = listJson.recipes.at(-1);
    expect(last.title).toContain("Garlic Butter Broccoli");
    expect(Array.isArray(last.steps)).toBeTruthy();
  });
});