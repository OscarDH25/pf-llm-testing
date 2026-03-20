const { test } = require("@playwright/test");
const {
  evaluateAskCase,
  formatEvaluationFailure,
  loadAskEvalDataset
} = require("../../evals/ask-eval-utils");

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

    await test.step(`Assert evaluation result for ${testCase.id}`, async () => {
      if (!evaluation.passed) {
        const failureMessage = formatEvaluationFailure(evaluation);

        test.info().annotations.push({
          type: "evaluation",
          description: failureMessage
        });

        throw new Error(failureMessage);
      }
    });
  });
}
