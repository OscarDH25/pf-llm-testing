module.exports = {
  testDir: "./tests/api",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3000"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3000/health",
    reuseExistingServer: true,
    cwd: __dirname,
    timeout: 30_000
  }
};
