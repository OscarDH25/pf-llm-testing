const { test, expect } = require("@playwright/test");

test("GET /health returns service status", async ({ request }) => {
  const response = await test.step("Send GET /health request", async () => {
    return request.get("/health");
  });

  const body = await test.step("Parse health response body", async () => {
    return response.json();
  });

  expect(response.status()).toBe(200);
  expect(body).toEqual({
    status: "ok",
    service: "pf-llm-testing-app"
  });
});

test("POST /ask returns a matching answer for Docker", async ({ request }) => {
  const payload = {
    question: "What is Docker?"
  };

  const response = await test.step("Send POST /ask request with a known topic", async () => {
    return request.post("/ask", {
      data: payload
    });
  });

  const body = await test.step("Parse successful answer response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(200);
  expect(body).toEqual({
    question: "What is Docker?",
    answer:
      "Docker packages applications and their dependencies into containers so they can run consistently across environments.",
    source: {
      id: "docker",
      title: "Docker overview"
    }
  });
});

test("POST /ask returns validation errors for an empty body", async ({ request }) => {
  const response = await test.step("Send POST /ask request with an empty body", async () => {
    return request.post("/ask", {
      data: {}
    });
  });

  const body = await test.step("Parse validation error response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(400);
  expect(body).toEqual({
    error: "Invalid request body",
    details: ["question is required"]
  });
});

test("POST /ask returns validation errors when question is an empty string", async ({ request }) => {
  const response = await test.step("Send POST /ask request with an empty string", async () => {
    return request.post("/ask", {
      data: {
        question: ""
      }
    });
  });

  const body = await test.step("Parse empty string validation response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(400);
  expect(body).toEqual({
    error: "Invalid request body",
    details: ["question must not be empty"]
  });
});

test("POST /ask returns validation errors when question only contains spaces", async ({ request }) => {
  const response = await test.step("Send POST /ask request with whitespace only", async () => {
    return request.post("/ask", {
      data: {
        question: "   "
      }
    });
  });

  const body = await test.step("Parse whitespace validation response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(400);
  expect(body).toEqual({
    error: "Invalid request body",
    details: ["question must not be empty"]
  });
});

test("POST /ask returns validation errors when question is not a string", async ({ request }) => {
  const response = await test.step("Send POST /ask request with a non-string question", async () => {
    return request.post("/ask", {
      data: {
        question: 123
      }
    });
  });

  const body = await test.step("Parse wrong type validation response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(400);
  expect(body).toEqual({
    error: "Invalid request body",
    details: ["question must be a string"]
  });
});

test("POST /ask returns an error for invalid JSON", async ({ request }) => {
  const response = await test.step("Send POST /ask request with invalid raw JSON", async () => {
    return request.fetch("/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      data: Buffer.from("{\"question\":")
    });
  });

  const body = await test.step("Parse invalid JSON error response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(400);
  expect(body).toEqual({
    error: "Request body must be valid JSON"
  });
});

test("POST /ask returns not found for an unknown topic", async ({ request }) => {
  const response = await test.step("Send POST /ask request for an unknown topic", async () => {
    return request.post("/ask", {
      data: {
        question: "What is Kubernetes?"
      }
    });
  });

  const body = await test.step("Parse not found response", async () => {
    return response.json();
  });

  expect(response.status()).toBe(404);
  expect(body).toEqual({
    error: "No matching document found"
  });
});
