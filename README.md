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

The repository is currently in the project definition phase. The first milestone is to define a realistic MVP, the initial architecture, and the development plan before implementation starts.

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
- `tests/`: placeholder for automated test suites

## Local run

From the `app` folder:

```bash
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
