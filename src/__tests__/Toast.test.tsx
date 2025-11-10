import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import Toast from "@/components/Toast.jsx";

describe("Toast", () => {
  let modalRoot: HTMLDivElement | null = null;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.id = "modal-root";
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    cleanup();
    modalRoot?.remove();
    modalRoot = null;
  });

  test("renders the message and closes when clicking the dismiss button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    const { rerender } = render(
      <Toast
        isOpen
        message="Opération réussie"
        variant="success"
        duration={0}
        onClose={onClose}
      />
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Opération réussie"
    );

    await user.click(screen.getByRole("button", { name: /x/i }));
    expect(onClose).toHaveBeenCalledTimes(1);

    rerender(
      <Toast
        isOpen={false}
        message="Opération réussie"
        variant="success"
        duration={0}
        onClose={onClose}
      />
    );

    await waitFor(() => expect(screen.queryByRole("status")).toBeNull());
  });
});
