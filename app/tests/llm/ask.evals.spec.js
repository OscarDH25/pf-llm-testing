const { test, expect } = require("@playwright/test");
const { evaluateAskCase, loadAskEvalDataset } = require("../../evals/ask-eval-utils");

const dataset = loadAskEvalDataset();

for (const testCase of dataset) {
  test(`ask eval: ${testCase.id}`, async ({ request }) => {
    const response = await test.step(`Send POST /ask for ${testCase.id}`, async () => {
      return request.post("/ask", {
        data: {
          question: testCase.question
        }
      });
    });

    const body = await test.step(`Parse response body for ${testCase.id}`, async () => {
      return response.json();
    });

    const evaluation = await test.step(`Evaluate response quality for ${testCase.id}`, async () => {
      return evaluateAskCase(testCase, {
        status: response.status(),
        body
      });
    });

    expect(evaluation.passed, JSON.stringify(evaluation, null, 2)).toBe(true);
  });
}
