const fs = require("node:fs");
const path = require("node:path");

const datasetPath = path.join(__dirname, "datasets", "ask-cases.json");

function loadAskEvalDataset() {
  return JSON.parse(fs.readFileSync(datasetPath, "utf8"));
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function includesTerm(text, term) {
  return normalizeText(text).includes(normalizeText(term));
}

function collectMatchedTerms(answer, terms) {
  return terms.filter((term) => includesTerm(answer, term));
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

function evaluateAskCase(testCase, result) {
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

module.exports = {
  evaluateAskCase,
  loadAskEvalDataset
};
