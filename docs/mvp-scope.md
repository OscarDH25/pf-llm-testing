# MVP scope

## Project idea

The project will be a small LLM-based API designed to be tested like a real product. Instead of focusing on product complexity, the repository will focus on test strategy, automation, evaluation, and delivery workflow.

The initial version will expose a limited set of AI capabilities over HTTP and include different automated checks to validate both functional behavior and response quality.

## MVP objective

Build a first version that is technically solid, realistic for a one-person side project, and strong enough to discuss in interviews.

The MVP must be small enough to finish, but broad enough to demonstrate:

- API automation
- basic end-to-end validation
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
- The setup is moving toward a single-entry local workflow so the finished project is easier to operate.
- The repository now also exposes a matching validation command so deployment and verification follow the same pattern.
- Kubernetes remains a later-stage extension after the local baseline is stable.

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

## Proposed initial stack

- Application: Node.js
- API/end-to-end tests: Playwright
- LLM evaluation layer: Python, pytest, and an LLM evaluation framework
- Containerization: Docker
- CI/CD: GitHub Actions
- Orchestration later: Kubernetes

## Why this stack

This stack balances learning value with delivery speed.

- Node.js keeps the application layer close to the current skill set
- Playwright strengthens modern QA automation skills
- Python and pytest are worth learning because many LLM evaluation tools are strongest there
- Docker and GitHub Actions are directly useful for portfolio value
- Kubernetes is important, but it should come after the core testing workflow works

## Planned phases after this branch

1. Create the initial project structure
2. Implement the first API endpoint and local app setup
3. Add baseline automated API tests
4. Add the first LLM evaluation checks
5. Add CI execution
6. Extend the project with stronger evals and deployment improvements

## Definition of done for the MVP

The MVP will be considered complete when:

- the API can answer questions using a fixed document set
- automated tests validate basic API behavior
- response quality is evaluated with a repeatable approach
- the full baseline suite can run locally
- the baseline suite runs automatically in CI
