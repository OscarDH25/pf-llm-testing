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

function countWords(text) {
  const normalized = String(text || "").trim();

  if (normalized.length === 0) {
    return 0;
  }

  return normalized.split(/\s+/).length;
}

function evaluateSuccessCase(testCase, result) {
  // These checks are intentionally heuristic: they give a first quality signal without needing a second LLM judge.
  const answer = result.body.answer || "";
  const requiredTerms = testCase.requiredTerms || [];
  const optionalTerms = testCase.optionalTerms || [];
  const forbiddenTerms = testCase.forbiddenTerms || [];
  const minimumAnswerWords = testCase.minimumAnswerWords || 1;
  const minimumOptionalTerms = testCase.minimumOptionalTerms || 0;

  const matchedRequiredTerms = collectMatchedTerms(answer, requiredTerms);
  const matchedOptionalTerms = collectMatchedTerms(answer, optionalTerms);
  const matchedForbiddenTerms = collectMatchedTerms(answer, forbiddenTerms);
  const answerWordCount = countWords(answer);

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
      name: "provider_matches_expected_runtime",
      passed: result.body.providerUsed === testCase.expectedProviderUsed,
      details: {
        expectedProviderUsed: testCase.expectedProviderUsed,
        providerUsed: result.body.providerUsed || null
      }
    },
    {
      name: "source_matches_expected_document",
      passed: result.body.source?.id === testCase.expectedSourceId
    },
    {
      name: "answer_has_minimum_word_count",
      passed: answerWordCount >= minimumAnswerWords,
      details: {
        minimumAnswerWords,
        answerWordCount
      }
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
      name: "enough_optional_terms_are_present",
      passed: matchedOptionalTerms.length >= minimumOptionalTerms,
      details: {
        optionalTerms,
        minimumOptionalTerms,
        matchedOptionalTerms
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
    optionalTermsMatched: `${matchedOptionalTerms.length}/${optionalTerms.length}`,
    answerWordCount
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

function humanizeCheckFailure(check) {
  switch (check.name) {
    case "status_is_200":
      return "The API did not return HTTP 200 for a success case.";
    case "answer_is_not_empty":
      return "The answer was empty.";
    case "provider_matches_expected_runtime":
      return `The response came from the wrong provider. Expected ${check.details.expectedProviderUsed}, received ${check.details.providerUsed}.`;
    case "source_matches_expected_document":
      return "The API did not attribute the answer to the expected source document.";
    case "answer_has_minimum_word_count":
      return `The answer was too short. Expected at least ${check.details.minimumAnswerWords} words, received ${check.details.answerWordCount}.`;
    case "all_required_terms_are_present": {
      const missingTerms = check.details.requiredTerms.filter(
        (term) => !check.details.matchedRequiredTerms.includes(term)
      );
      return `The answer missed required concepts: ${missingTerms.join(", ")}.`;
    }
    case "enough_optional_terms_are_present": {
      const missingOptionalTerms = check.details.optionalTerms.filter(
        (term) => !check.details.matchedOptionalTerms.includes(term)
      );
      return `The answer did not cover enough optional concepts. Missing examples: ${missingOptionalTerms.join(", ")}.`;
    }
    case "forbidden_terms_are_absent":
      return `The answer mentioned forbidden concepts: ${check.details.matchedForbiddenTerms.join(", ")}.`;
    case "status_matches_expected_error":
      return "The API did not return the expected error status.";
    case "error_message_matches_expected_error":
      return "The API did not return the expected error message.";
    default:
      return check.name;
  }
}

function formatEvaluationFailure(evaluation) {
  const failedChecks = evaluation.checks.filter((check) => !check.passed);
  const lines = [
    `Case: ${evaluation.id}`,
    "",
    `Question: ${evaluation.question}`,
    `HTTP status: ${evaluation.status}`,
    `Provider used: ${evaluation.providerUsed || "n/a"}`
  ];

  if (evaluation.responseBody?.answer) {
    lines.push(`Answer: ${evaluation.responseBody.answer}`);
  }

  if (evaluation.responseBody?.source?.id) {
    lines.push(`Source: ${evaluation.responseBody.source.id}`);
  }

  if (evaluation.score) {
    lines.push(
      `Score: required=${evaluation.score.requiredTermsMatched}, optional=${evaluation.score.optionalTermsMatched}, words=${evaluation.score.answerWordCount}`
    );
  }

  lines.push("");
  lines.push("Why it failed:");

  for (const check of failedChecks) {
    lines.push(`- ${humanizeCheckFailure(check)}`);
  }

  return lines.join("\n");
}

module.exports = {
  evaluateAskCase,
  formatEvaluationFailure,
  loadAskEvalDataset
};
