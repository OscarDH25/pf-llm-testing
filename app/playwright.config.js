module.exports = {
  testDir: "./tests/api",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3100"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3100/health",
    reuseExistingServer: false,
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: "3100",
      LLM_PROVIDER: "mock"
    },
    timeout: 30_000
  }
};
