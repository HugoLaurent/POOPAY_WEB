import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  base: "/", // important pour preview local
  server: { host: true, port: 4173 },
  preview: { host: true, port: 4173 },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: "./coverage",
    },
    exclude: ["tests-e2e/**/*", "node_modules/**/*"],
  },
});
