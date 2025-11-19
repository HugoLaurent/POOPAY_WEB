import { render } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import { describe, expect, test, vi } from "vitest";
import AppLayout from "@/components/AppLayout.jsx";
import { MemoryRouter } from "react-router-dom";

expect.extend(toHaveNoViolations);

vi.mock("@/hooks", () => ({
  useAuth: () => ({}),
}));

vi.mock("@/components/Header.jsx", () => ({
  default: () => (
    <header role="banner">
      <h1>Poopay</h1>
    </header>
  ),
}));

vi.mock("@/components/Footer.jsx", () => ({
  default: () => (
    <footer role="contentinfo">
      <p>Pied de page</p>
    </footer>
  ),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    Outlet: () => <div role="region" aria-label="Contenu principal" />,
  };
});

describe("AppLayout accessibility", () => {
  test("renders without axe violations", async () => {
    const { container } = render(
      <MemoryRouter>
        <AppLayout />
      </MemoryRouter>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
