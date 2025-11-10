import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { MemoryRouter } from "react-router-dom";
import App from "@/App.jsx";
import { AuthProvider } from "@/context/AuthContext.jsx";
import { NotificationsProvider } from "@/context/NotificationsContext.jsx";
import { PrivacyModalProvider } from "@/context/PrivacyModalContext.jsx";

const API_URL = "http://localhost:3333";
const VALID_EMAIL = "user@poopay.app";
const VALID_PASSWORD = "SuperSecret!23";
const TEST_USER = {
  id: 1,
  email: VALID_EMAIL,
  name: "Testeur Poopay",
  isPremium: false,
};

const DASHBOARD_FIXTURE = {
  sessions: [
    {
      id: 101,
      startTime: new Date().toISOString(),
      amountEarned: 4.5,
      durationSeconds: 600,
    },
  ],
  groups: [
    {
      id: 1,
      name: "Equipe Poopay",
      userPlace: 1,
      members: [
        { username: "Testeur Poopay", totalEarned: 12.5 },
        { username: "Teammate", totalEarned: 9.1 },
      ],
    },
  ],
};

vi.mock("socket.io-client", () => {
  const fakeSocket = () => ({
    on: vi.fn(),
    emit: vi.fn(),
    removeAllListeners: vi.fn(),
    disconnect: vi.fn(),
  });
  return {
    io: fakeSocket,
  };
});

const server = setupServer(
  http.post(`${API_URL}/login`, async ({ request }) => {
    const body = await request.json();
    if (body.email === VALID_EMAIL && body.password === VALID_PASSWORD) {
      return HttpResponse.json({
        result: true,
        data: { token: "token-123", user: TEST_USER },
      });
    }
    return HttpResponse.json(
      { result: false, message: "Invalid credentials" },
      { status: 401 }
    );
  }),
  http.get(`${API_URL}/me`, () =>
    HttpResponse.json({
      result: true,
      data: { token: "token-123", user: TEST_USER },
    })
  ),
  http.get(`${API_URL}/home`, () =>
    HttpResponse.json({ result: true, data: DASHBOARD_FIXTURE })
  ),
  http.get(`${API_URL}/notifications`, () =>
    HttpResponse.json({ result: true, notifications: [] })
  )
);

function renderApp() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <AuthProvider>
        <NotificationsProvider>
          <PrivacyModalProvider>
            <App />
          </PrivacyModalProvider>
        </NotificationsProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Login integration flow", () => {
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  beforeEach(() => {
    localStorage.clear();
  });

  test("allows a user to log in and reach the dashboard", async () => {
    renderApp();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(/email/i), VALID_EMAIL);
    await user.type(screen.getByLabelText(/mot de passe/i), VALID_PASSWORD);
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(
      await screen.findByRole("heading", {
        name: /classement de la semaine/i,
        level: 3,
      })
    ).toBeInTheDocument();
  });
});
