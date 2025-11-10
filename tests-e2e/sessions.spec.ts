import { expect, test } from "@playwright/test";
import { API_BASE_URL, allowCors, fulfillJson } from "./utils/network";
import { dismissCookieBanner } from "./utils/ui";

declare global {
  interface Window {
    __timeOffset?: number;
    __advanceTime?: (ms: number) => void;
  }
}

const VALID_EMAIL = "user@poopay.app";
const VALID_PASSWORD = "SuperSecret!23";

type SessionRecord = {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  amountEarned: number;
  status: string;
};

async function mockCommonRoutes(page, sessionsStore: SessionRecord[]) {
  await page.route(`${API_BASE_URL}/login`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, {
      result: true,
      data: {
        token: "token-123",
        user: {
          id: 1,
          email: VALID_EMAIL,
          name: "Testeur",
          isPremium: false,
        },
      },
    });
  });

  await page.route(`${API_BASE_URL}/me`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, {
      result: true,
      data: {
        token: "token-123",
        user: {
          id: 1,
          email: VALID_EMAIL,
          name: "Testeur",
          isPremium: false,
        },
      },
    });
  });

  await page.route(`${API_BASE_URL}/home`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, {
      result: true,
      data: {
        sessions: sessionsStore,
        groups: [],
      },
    });
  });

  await page.route(`${API_BASE_URL}/notifications`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, { result: true, notifications: [] });
  });

  await page.route(`${API_BASE_URL}/sessions`, async (route) => {
    const method = route.request().method();
    if (method === "OPTIONS") {
      return allowCors(route);
    }
    if (method === "GET") {
      return fulfillJson(route, { result: true, data: sessionsStore });
    }
    if (method === "POST") {
      const body = route.request().postDataJSON() ?? {};
      const newSession: SessionRecord = {
        id: `session-${Date.now()}`,
        startTime: body.startTime ?? new Date().toISOString(),
        endTime: body.endTime ?? new Date().toISOString(),
        durationSeconds: body.durationSeconds ?? 120,
        amountEarned: Math.round((body.durationSeconds ?? 120) / 6) / 100,
        status: "finished",
      };
      sessionsStore.unshift(newSession);
      return fulfillJson(route, { result: true, data: newSession });
    }
    if (method === "DELETE") {
      sessionsStore.splice(0, sessionsStore.length);
      return fulfillJson(route, { result: true, data: { ok: true } });
    }
    return route.continue();
  });

  await page.route(`${API_BASE_URL}/sessions/*`, async (route) => {
    const method = route.request().method();
    if (method === "OPTIONS") {
      return allowCors(route);
    }
    if (method === "DELETE") {
      const url = new URL(route.request().url());
      const parts = url.pathname.split("/");
      const sessionId = parts[parts.length - 1];
      const index = sessionsStore.findIndex((session) => session.id === sessionId);
      if (index >= 0) {
        sessionsStore.splice(index, 1);
      }
      return fulfillJson(route, { result: true, data: { ok: true } });
    }
    return route.continue();
  });
}

async function performLogin(page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(VALID_EMAIL);
  await page.getByLabel("Mot de passe").fill(VALID_PASSWORD);
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(
    page.getByRole("heading", { name: /classement de la semaine/i })
  ).toBeVisible();
  await dismissCookieBanner(page);
}

test.describe("Sessions management", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (window.__timeOffset == null) {
        const realNow = Date.now;
        window.__timeOffset = 0;
        window.__advanceTime = (ms) => {
          window.__timeOffset += ms;
        };
        Date.now = () => realNow() + window.__timeOffset;
      }
    });
  });

  test("creates and deletes a session", async ({ page }) => {
    const sessionsStore: SessionRecord[] = [];
    await mockCommonRoutes(page, sessionsStore);

    await performLogin(page);
    await page.getByRole("link", { name: "Timer" }).click();

    await page.getByRole("button", { name: "Commencer une session" }).click();
    await page.evaluate(() => window.__advanceTime(32000));
    await page.waitForTimeout(100);
    await page.getByRole("button", { name: "Terminer et enregistrer" }).click();

    await expect(
      page.getByText(/Session de/i, { exact: false })
    ).toBeVisible();

    await page.waitForURL("**/");
    await page.getByRole("link", { name: "Reglages" }).click();
    await page.getByRole("button", { name: "Mes sessions" }).click();

    await expect(page.getByText(/Session du/i)).toBeVisible();

    const listItem = page.locator("li", { hasText: "Session du" }).first();
    await listItem.getByRole("button", { name: "Supprimer" }).click();

    const confirmDialog = page
      .getByRole("dialog")
      .filter({ hasText: /Supprimer la session/i });
    await confirmDialog.waitFor({ state: "visible" });
    await confirmDialog.getByRole("button", { name: /^Supprimer$/ }).click();

    await expect(
      page.getByText("Aucune autre session active.")
    ).toBeVisible();
  });

  test("shows validation error for short session", async ({ page }) => {
    const sessionsStore: SessionRecord[] = [];
    await mockCommonRoutes(page, sessionsStore);

    await performLogin(page);
    await page.getByRole("link", { name: "Timer" }).click();

    await page.getByRole("button", { name: "Commencer une session" }).click();
    await page.getByRole("button", { name: "Terminer et enregistrer" }).click();

    await expect(
      page.getByText(/Session trop courte/, { exact: false })
    ).toBeVisible();
  });
});
