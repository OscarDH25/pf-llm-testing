const path = require("node:path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

function getConfig() {
  return {
    host: process.env.HOST || "127.0.0.1",
    port: Number(process.env.PORT || 3000),
    llmProvider: process.env.LLM_PROVIDER || "mock",
    ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
    ollamaModel: process.env.OLLAMA_MODEL || "qwen2.5:3b"
  };
}

module.exports = {
  getConfig
};
