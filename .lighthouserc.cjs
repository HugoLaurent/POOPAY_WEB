const { chromium } = require("playwright-core");

const chromePath =
  process.env.LHCI_CHROME_PATH ||
  (typeof chromium.executablePath === "function"
    ? chromium.executablePath()
    : undefined);

module.exports = {
  ci: {
    collect: {
      chromePath,
      startServerCommand:
        "npm run build && npm run preview -- --host 127.0.0.1 --port 4173",
      url: ["http://127.0.0.1:4173/"],
      numberOfRuns: 1,
      settings: {
        chromePath,
        chromeFlags: ["--headless=new"],
        preset: "desktop",
      },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
