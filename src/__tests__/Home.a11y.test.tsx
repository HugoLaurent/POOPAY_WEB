import { MemoryRouter } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import { beforeEach, describe, expect, test, vi } from "vitest";
import Home from "@/pages/Home.jsx";
import { PrivacyModalProvider } from "@/context/PrivacyModalContext.jsx";

expect.extend(toHaveNoViolations);

vi.mock("@/api", async () => {
  const actual = await vi.importActual<typeof import("@/api")>("@/api");
  const stats = {
    sessions: [
      {
        id: 1,
        startTime: "2024-03-01T08:00:00.000Z",
        endTime: "2024-03-01T08:45:00.000Z",
        durationSeconds: 2700,
        amountEarned: 8.5,
        status: "finished",
      },
    ],
    groups: [
      {
        id: 10,
        name: "Equipe Poopay",
        userPlace: 1,
        members: [
          { username: "Tester", totalEarned: 12.5 },
          { username: "Buddy", totalEarned: 9.4 },
        ],
      },
    ],
  };
  return {
    ...actual,
    HomeFetch: {
      getStats: vi.fn().mockResolvedValue(stats),
    },
  };
});

vi.mock("@/components/GoogleAd.jsx", () => ({
  default: () => <div data-testid="ad-slot">Publicite</div>,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuthContext: () => ({ user: { isPremium: false } }),
}));

describe("Home accessibility", () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
  });

  test("renders skip link, ARIA regions and passes axe", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MemoryRouter>
        <PrivacyModalProvider>
          <Home />
        </PrivacyModalProvider>
      </MemoryRouter>
    );

    expect(
      await screen.findByRole("heading", { name: /classement de la semaine/i })
    ).toBeVisible();

    const skipLink = screen.getByRole("link", {
      name: /aller au contenu principal/i,
    });
    await user.tab();
    expect(skipLink).toHaveFocus();

    expect(
      screen.getByRole("region", { name: /cette semaine/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: /classement de la semaine/i })
    ).toBeInTheDocument();

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
