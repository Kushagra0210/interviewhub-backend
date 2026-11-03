const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
  testDir: "tests/e2e",
  timeout: 60000,
  workers: 1,
  use: { baseURL: "http://localhost:3000", trace: "retain-on-failure" },
  webServer: [
    {
      command: "node tests/e2e-server.js",
      url: "http://localhost:4100/health",
      timeout: 120000,
      reuseExistingServer: false,
    },
    {
      command: "npm --prefix apps/web run dev",
      url: "http://localhost:3000",
      timeout: 120000,
      reuseExistingServer: false,
      env: { API_URL: "http://localhost:4100", NEXT_TELEMETRY_DISABLED: "1" },
    },
  ],
});
