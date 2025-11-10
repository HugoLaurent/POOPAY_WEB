import { expect, Page, test } from "@playwright/test";
import { API_BASE_URL, allowCors, fulfillJson } from "./utils/network";

const VALID_EMAIL = "user@poopay.app";
const VALID_PASSWORD = "SuperSecret!23";
const USER_PAYLOAD = {
  token: "token-123",
  user: {
    id: 1,
    email: VALID_EMAIL,
    name: "Testeur Poopay",
    isPremium: false,
  },
};

async function mockDashboardRoutes(page: Page) {
  await page.route(`${API_BASE_URL}/login`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, { result: true, data: USER_PAYLOAD });
  });

  await page.route(`${API_BASE_URL}/me`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, { result: true, data: USER_PAYLOAD });
  });

  await page.route(`${API_BASE_URL}/home`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, {
      result: true,
      data: {
        sessions: [
          {
            id: 101,
            startTime: new Date().toISOString(),
            amountEarned: 8,
            durationSeconds: 900,
          },
        ],
        groups: [
          {
            id: 1,
            name: "Equipe Poopay",
            userPlace: 1,
            members: [
              { username: "Testeur Poopay", totalEarned: 12.5 },
              { username: "Teammate", totalEarned: 9.3 },
            ],
          },
        ],
      },
    });
  });

  await page.route(`${API_BASE_URL}/notifications`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, { result: true, notifications: [] });
  });
}

test.describe("Login page", () => {
  test("shows an error message with invalid credentials", async ({ page }) => {
    await page.route(`${API_BASE_URL}/login`, async (route) => {
      if (route.request().method() === "OPTIONS") {
        return allowCors(route);
      }
      await fulfillJson(
        route,
        { result: false, message: "Identifiants invalides" },
        401
      );
    });

    await page.goto("/login");
    await page.getByLabel("Email").fill("wrong@poopay.app");
    await page.getByLabel("Mot de passe").fill("WrongPassword!23");
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByText("Identifiants invalides", { exact: false })
    ).toBeVisible();
  });

  test("navigates to the dashboard with valid credentials", async ({ page }) => {
    await mockDashboardRoutes(page);

    await page.goto("/login");
    await page.getByLabel("Email").fill(VALID_EMAIL);
    await page.getByLabel("Mot de passe").fill(VALID_PASSWORD);
    await page.getByRole("button", { name: "Se connecter" }).click();

    await expect(
      page.getByRole("heading", { name: /classement de la semaine/i })
    ).toBeVisible();
  });
});
