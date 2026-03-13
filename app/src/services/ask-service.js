const knowledgeBase = require("../../data/knowledge-base.json");

function findBestDocument(question) {
  const normalizedQuestion = question.trim().toLowerCase();

  return knowledgeBase.find((document) => {
    return (
      normalizedQuestion.includes(document.id) ||
      normalizedQuestion.includes(document.title.toLowerCase().replace(" overview", ""))
    );
  });
}

async function answerWithMockProvider(question) {
  const sourceDocument = findBestDocument(question);

  if (!sourceDocument) {
    return null;
  }

  return {
    answer: sourceDocument.content,
    source: {
      id: sourceDocument.id,
      title: sourceDocument.title
    }
  };
}

async function answerWithOllamaProvider(question, config) {
  const sourceDocument = findBestDocument(question);

  if (!sourceDocument) {
    return null;
  }

  let response;

  try {
    response = await fetch(`${config.ollamaBaseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: config.ollamaModel,
        stream: false,
        messages: [
          {
            role: "system",
            content:
              "Answer the user question using only the provided context. If the context is insufficient, say so clearly and do not invent facts."
          },
          {
            role: "user",
            content: `Context:\n${sourceDocument.content}\n\nQuestion:\n${question}`
          }
        ]
      })
    });
  } catch (cause) {
    const error = new Error(`Ollama request could not reach ${config.ollamaBaseUrl}`);
    error.statusCode = 502;
    error.code = "ollama_request_failed";
    error.cause = cause;
    throw error;
  }

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(`Ollama request failed with status ${response.status}: ${errorText}`);
    error.statusCode = 502;
    error.code = "ollama_request_failed";
    throw error;
  }

  const body = await response.json();
  const content = body.message?.content || "";

  if (content.trim().length === 0) {
    const error = new Error("Ollama response did not contain message content");
    error.statusCode = 502;
    error.code = "missing_message_content";
    throw error;
  }

  return {
    answer: content,
    providerUsed: "ollama",
    source: {
      id: sourceDocument.id,
      title: sourceDocument.title
    }
  };
}

async function answerQuestion(question, config) {
  if (config.llmProvider === "ollama") {
    try {
      return await answerWithOllamaProvider(question, config);
    } catch (error) {
      const canFallback =
        error.code === "ollama_request_failed" ||
        error.code === "missing_message_content";

      if (!canFallback) {
        throw error;
      }

      const mockResult = await answerWithMockProvider(question);

      if (!mockResult) {
        return null;
      }

      return {
        ...mockResult,
        providerUsed: "mock-fallback",
        fallbackReason: "ollama_unavailable"
      };
    }
  }

  const mockResult = await answerWithMockProvider(question);

  if (!mockResult) {
    return null;
  }

  return {
    ...mockResult,
    providerUsed: "mock"
  };
}

module.exports = {
  answerQuestion,
  findBestDocument
};
