const { evaluateAskCase, loadAskEvalDataset } = require("./ask-eval-utils");

const dataset = loadAskEvalDataset();

const API_BASE_URL = process.env.EVAL_API_BASE_URL || "http://127.0.0.1:3000";

async function askQuestion(question) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
    });
  } catch (error) {
    const connectionError = new Error(
      `Could not reach ${API_BASE_URL}. Start the API first with 'npm start' or run 'npm run test:llm' if you want Playwright to start it automatically.`
    );
    connectionError.cause = error;
    throw connectionError;
  }

  let body = null;

  try {
    body = await response.json();
  } catch (error) {
    // The evaluator should still report the HTTP-level result even if the body is malformed.
    body = {
      error: "Response body was not valid JSON"
    };
  }

  return {
    status: response.status,
    body
  };
}

function printCaseResult(result) {
  const statusLabel = result.passed ? "PASS" : "FAIL";
  console.log(`\n[${statusLabel}] ${result.id}`);
  console.log(`question: ${result.question}`);
  console.log(`http status: ${result.status}`);

  if (result.providerUsed) {
    console.log(`provider used: ${result.providerUsed}`);
  }

  if (result.fallbackReason) {
    console.log(`fallback reason: ${result.fallbackReason}`);
  }

  for (const check of result.checks) {
    const checkLabel = check.passed ? "ok" : "x";
    console.log(`- ${checkLabel} ${check.name}`);

    if (check.details) {
      console.log(`  details: ${JSON.stringify(check.details)}`);
    }
  }

  if (result.score) {
    console.log(`score: ${JSON.stringify(result.score)}`);
  }
}

async function main() {
  console.log(`Running ask-response evals against ${API_BASE_URL}`);

  const results = [];

  for (const testCase of dataset) {
    const apiResult = await askQuestion(testCase.question);
    const result = evaluateAskCase(testCase, apiResult);
    results.push(result);
    printCaseResult(result);
  }

  const passedCount = results.filter((result) => result.passed).length;
  const failedCount = results.length - passedCount;

  console.log("\nSummary");
  console.log(`- total: ${results.length}`);
  console.log(`- passed: ${passedCount}`);
  console.log(`- failed: ${failedCount}`);

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error("Evaluation run failed");
  console.error(error.message);

  if (error.cause?.message) {
    console.error(`Cause: ${error.cause.message}`);
  }

  process.exitCode = 1;
});
