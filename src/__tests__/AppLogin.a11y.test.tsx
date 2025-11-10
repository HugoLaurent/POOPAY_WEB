import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Login from "@/pages/Login.jsx";

expect.extend(toHaveNoViolations);

vi.mock("@/context/AuthContext", () => ({
  useAuthContext: () => ({
    login: vi.fn(),
  }),
}));

vi.mock("@/hooks", async () => {
  const actual = await vi.importActual<typeof import("@/hooks")>("@/hooks");
  return {
    ...actual,
    usePrivacyModal: () => ({ open: vi.fn() }),
  };
});

vi.mock("@/api", () => ({
  Auth: {
    login: vi.fn().mockResolvedValue({ data: { token: "t", user: {} } }),
  },
}));

describe("Login page accessibility", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  test("has labeled inputs, roles and passes axe", async () => {
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /poopay/i })).toBeVisible();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /se connecter/i })
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test("supports keyboard focus order", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.tab();
    expect(screen.getByLabelText(/email/i)).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText(/mot de passe/i)).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: /politique de confidentialit/i })
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("link", { name: /inscrire/i })
    ).toHaveFocus();
  });
});
