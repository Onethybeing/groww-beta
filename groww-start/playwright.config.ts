import { defineConfig } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "e2e",
  timeout: 90_000,
  use: { baseURL: `http://localhost:${PORT}`, viewport: { width: 390, height: 844 }, trace: "retain-on-failure" },
  webServer: { command: `npm run build && npx next start -p ${PORT}`, url: `http://localhost:${PORT}`, reuseExistingServer: true, timeout: 300_000 },
});
