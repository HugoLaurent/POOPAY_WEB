import { Page } from "@playwright/test";

export async function dismissCookieBanner(page: Page) {
  const acceptButton = page.getByRole("button", { name: /tout accepter/i });
  try {
    await acceptButton.waitFor({ state: "visible", timeout: 4000 });
    await acceptButton.click();
  } catch {
    // Banner not displayed, nothing to do.
  }

  await page.evaluate(() => {
    const root = document.getElementById("tarteaucitronRoot");
    if (root) {
      root.style.display = "none";
      root.setAttribute("aria-hidden", "true");
    }
    const alert = document.getElementById("tarteaucitronAlertBig");
    if (alert) {
      alert.style.display = "none";
    }
  });
}
