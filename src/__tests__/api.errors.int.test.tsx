import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import Toast from "@/components/Toast.jsx";
import { api } from "@/api/api.js";

const API_URL = "http://localhost:3333";

const cases = [
  { code: 401, message: "Token invalide" },
  { code: 403, message: "Accès interdit" },
  { code: 429, message: "Trop de requêtes" },
  { code: 500, message: "Internal Server Error" },
];

const server = setupServer(
  http.get(`${API_URL}/errors/401`, () =>
    HttpResponse.json({ result: false, message: "Token invalide" }, { status: 401 })
  ),
  http.get(`${API_URL}/errors/403`, () =>
    HttpResponse.json({ result: false, message: "Accès interdit" }, { status: 403 })
  ),
  http.get(`${API_URL}/errors/429`, () =>
    HttpResponse.json({ result: false, message: "Trop de requêtes" }, { status: 429 })
  ),
  http.get(`${API_URL}/errors/500`, () =>
    HttpResponse.json({ result: false }, { status: 500, statusText: "Internal Server Error" })
  )
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("api error handling", () => {
  cases.forEach(({ code, message }) => {
    test(`rejects with message for status ${code}`, async () => {
      await expect(api(`/errors/${code}`)).rejects.toMatchObject({
        message,
        status: code,
      });
    });
  });

  test("displays toast with payload message", async () => {
    document.body.innerHTML = '<div id="modal-root"></div>';
    const user = userEvent.setup();

    function ErrorTester({ path }: { path: string }) {
      const [toast, setToast] = useState({
        isOpen: false,
        message: "",
      });

      const trigger = async () => {
        try {
          await api(path);
        } catch (err) {
          setToast({
            isOpen: true,
            message: err.message,
          });
        }
      };

      return (
        <>
          <button type="button" onClick={trigger}>
            Charger
          </button>
          <Toast
            isOpen={toast.isOpen}
            message={toast.message}
            variant="error"
            onClose={() => setToast({ isOpen: false, message: "" })}
          />
        </>
      );
    }

    render(<ErrorTester path="/errors/403" />);
    await user.click(screen.getByRole("button", { name: /charger/i }));

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Accès interdit"
    );
  });
});
