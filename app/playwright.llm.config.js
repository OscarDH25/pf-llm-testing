module.exports = {
  testDir: "./tests/llm",
  timeout: 30_000,
  retries: 0,
  reporter: [["./tests/llm/llm-reporter.js"]],
  use: {
    baseURL: "http://127.0.0.1:3200"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3200/health",
    reuseExistingServer: false,
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: "3200",
      LLM_PROVIDER: "ollama"
    },
    timeout: 30_000
  }
};
