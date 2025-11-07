import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

import CookieConsent from "../CookieConsent.jsx";

const apiMock = vi.fn();

vi.mock("@/api", () => ({
  api: (...args) => apiMock(...args),
}));

const authState = {
  token: "token-123",
  logout: vi.fn(),
};
const setMockAuthState = (overrides) => {
  Object.assign(authState, overrides);
};

vi.mock("@/context/AuthContext.jsx", () => ({
  useAuthContext: () => authState,
}));

const CONSENT_STORAGE_KEY = "poopay_cookie_consent_queue";

function setupTarteaucitron({
  state = { google_analytics: true },
  job = ["google_analytics"],
} = {}) {
  window.tarteaucitron = {
    init: vi.fn(() => true),
    parameters: { cookieName: "poopay_cookie_consent" },
    job: [...job],
    state: { ...state },
    uuid: "tarte-uuid",
    events: {
      on: vi.fn(),
      off: vi.fn(),
    },
  };
}

describe("CookieConsent", () => {
  beforeEach(() => {
    apiMock.mockReset();
    setMockAuthState({ token: "token-123", logout: vi.fn() });
    localStorage.clear();
    setupTarteaucitron();
    document.cookie = "poopay_cookie_consent=!test";
  });

  afterEach(() => {
    cleanup();
    delete window.tarteaucitron;
  });

  it("sends the consent payload to the API once a decision is recorded and the user is authenticated", async () => {
    apiMock.mockResolvedValue({});

    render(<CookieConsent />);

    await waitFor(() => expect(window.tarteaucitron.init).toHaveBeenCalled());

    document.dispatchEvent(new Event("tac.consent_updated"));

    await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(1));

    const [path, options] = apiMock.mock.calls[0];
    expect(path).toBe("/consents");
    expect(options).toMatchObject({
      method: "POST",
      token: "token-123",
    });
    expect(options.body).toMatchObject({
      type: "cookie_banner",
      metadata: {
        provider: "tarteaucitron",
        decision: "accept",
        acceptedServices: ["google_analytics"],
      },
    });
    expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull();
  });

  it("stores the consent locally when the token is missing then flushes it once the token becomes available", async () => {
    apiMock.mockResolvedValue({});
    setMockAuthState({ token: null, logout: vi.fn() });

    const { rerender } = render(<CookieConsent />);

    await waitFor(() => expect(window.tarteaucitron.init).toHaveBeenCalled());

    document.dispatchEvent(new Event("tac.consent_updated"));

    expect(apiMock).not.toHaveBeenCalled();

    const queued = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY));
    expect(Array.isArray(queued)).toBe(true);
    expect(queued).toHaveLength(1);

    setMockAuthState({ token: "late-token" });
    rerender(<CookieConsent />);

    await waitFor(() => expect(apiMock).toHaveBeenCalledTimes(1));
    const [, options] = apiMock.mock.calls[0];
    expect(options.token).toBe("late-token");
    await waitFor(() => expect(localStorage.getItem(CONSENT_STORAGE_KEY)).toBeNull());
  });
});

