# MVP scope

## Project idea

The project will be a small LLM-based API designed to be tested like a real product. Instead of focusing on product complexity, the repository will focus on test strategy, automation, evaluation, and delivery workflow.

The initial version will expose a limited set of AI capabilities over HTTP and include different automated checks to validate both functional behavior and response quality.

## MVP objective

Build a first version that is technically solid, realistic for a one-person side project, and strong enough to discuss in interviews.

The MVP must be small enough to finish, but broad enough to demonstrate:

- API automation
- backend validation through repeatable smoke and API checks
- LLM evaluation concepts
- CI execution
- Docker-based local setup

## MVP features

The MVP will include:

- A small API with one LLM-powered use case
- A deterministic dataset with representative test cases
- Automated API tests
- A first evaluation layer for model responses
- Docker support for local execution
- A CI workflow that runs the baseline checks

Current implementation status:

- API, Playwright API tests, Ollama integration, CI, and the first LLM evaluation layer are already in place.
- Docker support is now part of the repository setup.
- CI coverage now extends beyond API checks to include deterministic LLM evaluation and Docker image build validation.
- A first Kubernetes deployment foundation is now part of the repository for local learning and demonstration.
- Local helper scripts are now part of the setup so the project is easier to run and demonstrate.
- The repository now exposes a single-entry local workflow so the finished project is easier to operate.
- The repository now also exposes a matching validation command so deployment and verification follow the same pattern.
- The current Kubernetes setup is intentionally local and educational rather than production-grade.

## Use case selected for the MVP

The first use case will be a question-answering API over a fixed set of documents.

Why this use case:

- It is easy to understand in interviews
- It creates realistic AI testing problems such as hallucinations and incomplete answers
- It allows deterministic datasets and evaluation rules
- It leaves room for future extensions without reworking the whole project

## Initial scope boundaries

To keep the project realistic, the MVP will not include:

- multiple microservices
- advanced frontend work
- full red teaming coverage
- complex Kubernetes deployment
- multi-model comparison from day one

Those can be added later once the base system and testing strategy are stable.

## Final stack used in the repository

- Application: Node.js
- API tests: Playwright
- LLM evaluation layer: Node.js scripts and Playwright
- Containerization: Docker
- CI/CD: GitHub Actions
- Local orchestration/demo layer: Kubernetes

## Why this stack

This stack balances learning value with delivery speed.

- Node.js keeps the application layer close to the current skill set
- Playwright strengthens modern QA automation skills
- Keeping the evaluation layer in the same runtime reduced scope and kept the project finishable
- Docker and GitHub Actions are directly useful for portfolio value
- Kubernetes adds deployment value once the core testing workflow works

## Delivery summary

The project has now reached the originally intended MVP shape:

1. A small question-answering API exists and runs locally.
2. Playwright validates the API contract.
3. A separate response-quality layer evaluates LLM behavior.
4. Baseline checks run in CI.
5. Docker and local Kubernetes flows are both available for demonstration.
6. Unified scripts reduce setup and validation friction.

## Definition of done for the MVP

The MVP will be considered complete when:

- the API can answer questions using a fixed document set
- automated tests validate basic API behavior
- response quality is evaluated with a repeatable approach
- the full baseline suite can run locally
- the baseline suite runs automatically in CI
