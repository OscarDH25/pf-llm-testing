process.env.ASK_EVAL_DATASET_FILE = "ask-cases-mock.json";

module.exports = {
  testDir: "./tests/llm",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3300"
  },
  webServer: {
    command: "npm start",
    url: "http://127.0.0.1:3300/health",
    reuseExistingServer: false,
    cwd: __dirname,
    env: {
      ...process.env,
      HOST: "127.0.0.1",
      PORT: "3300",
      LLM_PROVIDER: "mock"
    },
    timeout: 30_000
  }
};
