// API tests target the local backend started manually during this phase.
module.exports = {
  testDir: "./tests/api",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:3000"
  }
};
