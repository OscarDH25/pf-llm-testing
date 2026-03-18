# pf_llm_testing

Portfolio project focused on AI testing, LLM evaluation, QA automation, and CI/CD.

## Project vision

The goal of this repository is to build a small but realistic AI system and validate it with a professional QA approach. The project is designed to showcase practical skills in automated testing for LLM-based applications rather than just building another demo chatbot.

## What this project aims to demonstrate

- QA automation for AI-powered systems
- API and end-to-end testing
- LLM response evaluation and regression testing
- CI/CD integration
- Containerized development workflow
- Kubernetes readiness for later stages

## Current status

The repository already includes:

- a small HTTP API with `GET /health` and `POST /ask`
- a fixed knowledge base used for deterministic testing
- a real local LLM provider through Ollama
- a Playwright API test suite
- a GitHub Actions workflow for automated API checks

## Working model

- `main`: stable branch
- `feature/<name>`: new functionality
- `chore/<name>`: maintenance, docs, tooling, CI
- `fix/<name>`: bug fixes

## Documentation

- [API contract](docs/api-contract.md)
- [MVP scope](docs/mvp-scope.md)

## Current project structure

- `app/`: backend application
- `docs/`: project documentation
- `tests/`: high-level testing documentation

## Environment configuration

The application supports a provider-based setup.

Current provider modes:

- `mock`: local provider backed by the fixed knowledge base
- `ollama`: real local provider using the Ollama HTTP API

To create a local environment file inside `app/`:

```bash
copy .env.example .env
```

Then configure the local provider in `app/.env`:

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:3b
```

## Ollama setup

To use the real local LLM provider, install Ollama and pull a model such as `qwen2.5:3b`.

Typical commands:

```bash
ollama pull qwen2.5:3b
ollama run qwen2.5:3b
```

If the Ollama provider is unavailable, the application falls back to the local `mock` provider so the API remains usable during development.

## Running on another machine

The project can be reproduced on any machine that has:

- Node.js installed
- Ollama installed
- the configured local model pulled, for example `qwen2.5:3b`

After cloning the repository:

```bash
cd app
copy .env.example .env
npm install
```

Then make sure Ollama is running locally and start the API with:

```bash
npm start
```

## Local run

From the `app` folder:

```bash
npm install
npm start
```

Then check:

```bash
GET /health
```

The application also exposes:

```bash
POST /ask
```

PowerShell example:

```powershell
$body = @{
  question = "What is Docker?"
} | ConvertTo-Json

Invoke-WebRequest -UseBasicParsing `
  -Method POST `
  -Uri http://127.0.0.1:3000/ask `
  -ContentType "application/json" `
  -Body $body
```

## Current testing status

The repository includes an API suite with Playwright for the existing endpoints.

Run the current API test suite from the `app` folder:

```bash
npm run test:api
```

Playwright starts the local backend automatically for the API suite.

## First LLM evaluation layer

The repository now also includes a first response-evaluation script for `POST /ask`.

This evaluation layer is separate from API contract tests:

- Playwright checks that the API behaves correctly
- the eval script checks whether the answer content looks acceptable for a small controlled dataset

Run from the `app` folder after starting the API:

```bash
npm run eval:ask
```

## CI

The repository includes a GitHub Actions workflow that installs dependencies and runs the API test suite automatically on pushes and pull requests.
