const http = require("node:http");
const { getConfig } = require("./config");
const { answerQuestion } = require("./services/ask-service");

const HOST = "127.0.0.1";
const config = getConfig();
const PORT = config.port;

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(new Error("Request body must be valid JSON"));
      }
    });

    request.on("error", () => {
      reject(new Error("Failed to read request body"));
    });
  });
}

function validateAskRequest(payload) {
  const errors = [];

  if (!Object.prototype.hasOwnProperty.call(payload, "question")) {
    errors.push("question is required");
  } else if (typeof payload.question !== "string") {
    errors.push("question must be a string");
  } else if (payload.question.trim().length === 0) {
    errors.push("question must not be empty");
  }

  return errors;
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      status: "ok",
      service: "pf-llm-testing-app",
      llmProvider: config.llmProvider
    });
    return;
  }

  if (request.method === "POST" && request.url === "/ask") {
    readJsonBody(request)
      .then((payload) => {
        const errors = validateAskRequest(payload);

        if (errors.length > 0) {
          sendJson(response, 400, {
            error: "Invalid request body",
            details: errors
          });
          return;
        }

        return answerQuestion(payload.question, config).then((result) => {
          if (!result) {
            sendJson(response, 404, {
              error: "No matching document found"
            });
            return;
          }

          sendJson(response, 200, {
            question: payload.question,
            answer: result.answer,
            source: result.source,
            providerUsed: result.providerUsed,
            fallbackReason: result.fallbackReason || null
          });
        });
      })
      .catch((error) => {
        sendJson(response, error.statusCode || 400, {
          error: error.message
        });
      });
    return;
  }

  sendJson(response, 404, {
    error: "Not Found"
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server running at http://${HOST}:${PORT}`);
});
