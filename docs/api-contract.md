# API contract

## `GET /health`

Returns the basic health status of the service.

Example response:

```json
{
  "status": "ok",
  "service": "pf-llm-testing-app"
}
```

## `POST /ask`

Accepts a user question and returns an answer based on the fixed internal document set.

### Request body

```json
{
  "question": "What is Docker?"
}
```

### Validation rules

- `question` is required
- `question` must be a string
- `question` must not be empty after trimming

### Success response

```json
{
  "question": "What is Docker?",
  "answer": "Docker packages applications and their dependencies into containers so they can run consistently across environments.",
  "source": {
    "id": "docker",
    "title": "Docker overview"
  }
}
```

### Error response

```json
{
  "error": "Invalid request body",
  "details": [
    "question is required"
  ]
}
```
