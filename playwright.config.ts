import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;
const HOST = "127.0.0.1";

export default defineConfig({
  testDir: "./tests-e2e",
  timeout: 60 * 1000,
  expect: {
    timeout: 10 * 1000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://${HOST}:${PORT}`,
    trace: "on-first-retry",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: `npm run dev -- --host ${HOST} --port ${PORT}`,
    url: `http://${HOST}:${PORT}`,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        firefoxUserPrefs: {
          "browser.sessionstore.resume_from_crash": false,
          "browser.sessionstore.enabled": false,
        },
      },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
});
