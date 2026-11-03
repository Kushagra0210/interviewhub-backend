const { defineConfig } = require("@playwright/test");
const base = require("./playwright.config");
module.exports = defineConfig({
  ...base,
  testDir: "tests/live",
  timeout: 300000,
  webServer: base.webServer.map((s, i) =>
    i === 0 ? { ...s, env: { LIVE_AI: "1" } } : s,
  ),
});
