const { test, expect } = require("@playwright/test");

test("GET /health returns service status", async ({ request }) => {
  const response = await request.get("/health");
  const body = await response.json();

  expect(response.status()).toBe(200);
  expect(body).toEqual({
    status: "ok",
    service: "pf-llm-testing-app"
  });
});

test("POST /ask returns a matching answer for Docker", async ({ request }) => {
  const response = await request.post("/ask", {
    data: {
      question: "What is Docker?"
    }
  });
  const body = await response.json();

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
  const response = await request.post("/ask", {
    data: {}
  });
  const body = await response.json();

  expect(response.status()).toBe(400);
  expect(body).toEqual({
    error: "Invalid request body",
    details: ["question is required"]
  });
});

test("POST /ask returns not found for an unknown topic", async ({ request }) => {
  const response = await request.post("/ask", {
    data: {
      question: "What is Kubernetes?"
    }
  });
  const body = await response.json();

  expect(response.status()).toBe(404);
  expect(body).toEqual({
    error: "No matching document found"
  });
});
