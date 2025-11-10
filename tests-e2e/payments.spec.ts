import { expect, test } from "@playwright/test";
import { API_BASE_URL, allowCors, fulfillJson } from "./utils/network";
import { dismissCookieBanner } from "./utils/ui";

const VALID_EMAIL = "user@poopay.app";
const VALID_PASSWORD = "SuperSecret!23";

const STRIPE_STUB = `
(() => {
  window.Stripe = function Stripe() {
    const element = {
      mount(node) {
        this._node = node;
        const input = document.createElement('input');
        input.setAttribute('data-testid', 'card-input');
        input.setAttribute('aria-label', 'Numéro de carte');
        input.style.width = '100%';
        input.style.border = 'none';
        node.appendChild(input);
      },
      unmount() {
        if (this._node) this._node.innerHTML = '';
      },
      destroy() {},
      on() {},
      addEventListener() {},
      removeEventListener() {},
      update() {},
      clear() {
        if (this._node) {
          const input = this._node.querySelector('input');
          if (input) input.value = '';
        }
      },
    };
    const elements = {
      create() {
        return element;
      },
      getElement() {
        return element;
      },
    };
    return {
      elements: () => elements,
      confirmCardPayment: () =>
        Promise.resolve({
          paymentIntent: { id: 'pi_test', status: 'succeeded' },
        }),
    };
  };
})();
`;

type PaymentsState = {
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    providerPaymentIntentId: string;
    createdAt: string;
    succeededAt: string;
  }>;
  subscription: null | {
    status: string;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
};

async function mockBaseRoutes(page) {
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
        sessions: [],
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
}

async function mockPaymentsRoutes(
  page,
  state: PaymentsState,
  { failSync = false }: { failSync?: boolean } = {}
) {
  await page.route(`${API_BASE_URL}/payments`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    if (route.request().method() === "GET") {
      return fulfillJson(route, {
        result: true,
        data: {
          payments: state.payments,
          subscription: state.subscription,
        },
      });
    }
    return route.continue();
  });

  await page.route(`${API_BASE_URL}/payments/intent`, async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    return fulfillJson(route, {
      result: true,
      data: {
        payment: { id: "pay_test", amount: 999, currency: "eur" },
        clientSecret: "secret_test",
      },
    });
  });

  await page.route("**/payments/**/sync", async (route) => {
    if (route.request().method() === "OPTIONS") {
      return allowCors(route);
    }
    if (failSync) {
      return fulfillJson(
        route,
        { result: false, message: "Synchronisation impossible" },
        500
      );
    }
    const now = new Date();
    state.subscription = {
      status: "active",
      currentPeriodStart: now.toISOString(),
      currentPeriodEnd: new Date(now.getTime() + 30 * 86400000).toISOString(),
    };
    state.payments.unshift({
      id: "pay_test",
      amount: 999,
      currency: "eur",
      status: "succeeded",
      providerPaymentIntentId: "pi_test",
      createdAt: now.toISOString(),
      succeededAt: now.toISOString(),
    });
    return fulfillJson(route, {
      result: true,
      data: { subscription: state.subscription },
    });
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

const viewports = [
  { name: "mobile", size: { width: 360, height: 740 } },
  { name: "tablet", size: { width: 768, height: 1024 } },
];

for (const vp of viewports) {
  test.describe(`${vp.name} payments`, () => {
    test.use({ viewport: vp.size });

    test.beforeEach(async ({ page }) => {
      await page.route("https://js.stripe.com/**", async (route) => {
        await route.fulfill({
          status: 200,
          contentType: "application/javascript",
          body: STRIPE_STUB,
        });
      });
    });

    test("completes a payment intent and updates history", async ({ page }) => {
      const state: PaymentsState = { payments: [], subscription: null };
      await mockBaseRoutes(page);
      await mockPaymentsRoutes(page, state);

      await performLogin(page);
      await page.getByRole("link", { name: "Reglages" }).click();
      await page
        .getByRole("button", { name: /Gerer mon abonnement/i })
        .click();

      await expect(
        page.getByRole("heading", { name: /Gestion de l'abonnement/i })
      ).toBeVisible();

      await page.fill('[data-testid="card-input"]', "4242424242424242");
      await page
        .getByRole("button", { name: /Activer le premium/i })
        .click();

      await expect(
        page.getByText(/Paiement test validé/i)
      ).toBeVisible();
      await expect(
        page.getByText(/Abonnement premium actif/i)
      ).toBeVisible();
      await expect(page.getByText(/9,99/i)).toBeVisible();
    });

    test("shows error when sync fails", async ({ page }) => {
      const state: PaymentsState = { payments: [], subscription: null };
      await mockBaseRoutes(page);
      await mockPaymentsRoutes(page, state, { failSync: true });

      await performLogin(page);
      await page.getByRole("link", { name: "Reglages" }).click();
      await page
        .getByRole("button", { name: /Gerer mon abonnement/i })
        .click();

      await page.fill('[data-testid="card-input"]', "4242424242424242");
      await page
        .getByRole("button", { name: /Activer le premium/i })
        .click();

      await expect(
        page.getByText(/Synchronisation impossible/i)
      ).toBeVisible();
    });
  });
}
