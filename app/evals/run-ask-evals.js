const fs = require("node:fs");
const path = require("node:path");

const datasetPath = path.join(__dirname, "datasets", "ask-cases.json");
const dataset = JSON.parse(fs.readFileSync(datasetPath, "utf8"));

const API_BASE_URL = process.env.EVAL_API_BASE_URL || "http://127.0.0.1:3000";

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function includesTerm(text, term) {
  return normalizeText(text).includes(normalizeText(term));
}

function collectMatchedTerms(answer, terms) {
  return terms.filter((term) => includesTerm(answer, term));
}

async function askQuestion(question) {
  const response = await fetch(`${API_BASE_URL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ question })
  });

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

function evaluateSuccessCase(testCase, result) {
  // These checks are intentionally heuristic: they give a first quality signal without needing a second LLM judge.
  const answer = result.body.answer || "";
  const requiredTerms = testCase.requiredTerms || [];
  const optionalTerms = testCase.optionalTerms || [];
  const forbiddenTerms = testCase.forbiddenTerms || [];

  const matchedRequiredTerms = collectMatchedTerms(answer, requiredTerms);
  const matchedOptionalTerms = collectMatchedTerms(answer, optionalTerms);
  const matchedForbiddenTerms = collectMatchedTerms(answer, forbiddenTerms);

  const checks = [
    {
      name: "status_is_200",
      passed: result.status === 200
    },
    {
      name: "answer_is_not_empty",
      passed: normalizeText(answer).length > 0
    },
    {
      name: "source_matches_expected_document",
      passed: result.body.source?.id === testCase.expectedSourceId
    },
    {
      name: "all_required_terms_are_present",
      passed: matchedRequiredTerms.length === requiredTerms.length,
      details: {
        requiredTerms,
        matchedRequiredTerms
      }
    },
    {
      name: "forbidden_terms_are_absent",
      passed: matchedForbiddenTerms.length === 0,
      details: {
        forbiddenTerms,
        matchedForbiddenTerms
      }
    }
  ];

  const score = {
    requiredTermsMatched: `${matchedRequiredTerms.length}/${requiredTerms.length}`,
    optionalTermsMatched: `${matchedOptionalTerms.length}/${optionalTerms.length}`
  };

  return {
    passed: checks.every((check) => check.passed),
    checks,
    score,
    providerUsed: result.body.providerUsed || null,
    fallbackReason: result.body.fallbackReason || null
  };
}

function evaluateErrorCase(testCase, result) {
  const checks = [
    {
      name: "status_matches_expected_error",
      passed: result.status === testCase.expectedStatus
    },
    {
      name: "error_message_matches_expected_error",
      passed: result.body.error === testCase.expectedError
    }
  ];

  return {
    passed: checks.every((check) => check.passed),
    checks,
    providerUsed: null,
    fallbackReason: null
  };
}

async function evaluateCase(testCase) {
  const result = await askQuestion(testCase.question);
  const evaluation =
    testCase.expectedStatus === 200
      ? evaluateSuccessCase(testCase, result)
      : evaluateErrorCase(testCase, result);

  return {
    id: testCase.id,
    question: testCase.question,
    status: result.status,
    responseBody: result.body,
    ...evaluation
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
    const result = await evaluateCase(testCase);
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
  process.exitCode = 1;
});
