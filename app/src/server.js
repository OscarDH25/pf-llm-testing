const http = require("node:http");
const knowledgeBase = require("../data/knowledge-base.json");

const HOST = "127.0.0.1";
const PORT = Number(process.env.PORT || 3000);

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

function findBestDocument(question) {
  const normalizedQuestion = question.trim().toLowerCase();

  return knowledgeBase.find((document) => {
    return (
      normalizedQuestion.includes(document.id) ||
      normalizedQuestion.includes(document.title.toLowerCase().replace(" overview", ""))
    );
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      status: "ok",
      service: "pf-llm-testing-app"
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

        const sourceDocument = findBestDocument(payload.question);

        if (!sourceDocument) {
          sendJson(response, 404, {
            error: "No matching document found"
          });
          return;
        }

        sendJson(response, 200, {
          question: payload.question,
          answer: sourceDocument.content,
          source: {
            id: sourceDocument.id,
            title: sourceDocument.title
          }
        });
      })
      .catch((error) => {
        sendJson(response, 400, {
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
