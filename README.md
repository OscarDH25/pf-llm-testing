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
- a GitHub Actions workflow for API tests, deterministic LLM checks, and Docker build validation

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
HOST=127.0.0.1
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
- Docker Desktop installed if you want to run the API in a container
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

## Docker run

The repository now also includes a minimal container setup for the API.

Build the image from the repository root:

```bash
docker build -t pf-llm-testing-app ./app
```

Run the container with the mock provider:

```bash
docker run --rm -p 3000:3000 -e HOST=0.0.0.0 -e LLM_PROVIDER=mock pf-llm-testing-app
```

If you want the container to call a local Ollama instance running on the host machine, use:

```bash
docker run --rm -p 3000:3000 ^
  -e HOST=0.0.0.0 ^
  -e LLM_PROVIDER=ollama ^
  -e OLLAMA_BASE_URL=http://host.docker.internal:11434 ^
  -e OLLAMA_MODEL=qwen2.5:3b ^
  pf-llm-testing-app
```

You can also start the same setup with Docker Compose from the repository root:

```bash
docker compose up --build
```

The included `compose.yaml` is configured for a local Ollama instance exposed through `host.docker.internal`.

If your local Docker environment cannot pull `node:20-alpine` from Docker Hub but already has `nginx:alpine` cached, you can use the local fallback image definition:

```bash
docker build -f ./app/Dockerfile.local -t pf-llm-testing-app-local ./app
```

## Kubernetes foundation

The repository now also includes a first local Kubernetes setup under `k8s/`.

This initial version is intentionally simple:

- one namespace
- one config map
- one deployment
- one service
- readiness and liveness probes against `/health`

The default Kubernetes runtime uses the `mock` provider so the deployment stays reproducible without depending on a running Ollama instance.

Typical local flow:

```bash
docker build -t pf-llm-testing-app ./app
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl port-forward -n pf-llm-testing service/pf-llm-testing-service 3000:3000
```

More details are documented in:

- `k8s/README.md`

If you use Docker Desktop Kubernetes, make sure Kubernetes is enabled first and that `kubectl config current-context` returns `docker-desktop` before applying the manifests.

## Local deployment scripts

The repository now also includes PowerShell helper scripts under `scripts/` to reduce repetitive setup steps.

The main entrypoint is now:

```powershell
.\scripts\dev-up.ps1 -Mode local
.\scripts\dev-up.ps1 -Mode docker
.\scripts\dev-up.ps1 -Mode k8s
```

This keeps the most common ways of starting the project behind one consistent command shape.

The matching validation entrypoint is:

```powershell
.\scripts\dev-test.ps1 -Mode local
.\scripts\dev-test.ps1 -Mode docker
.\scripts\dev-test.ps1 -Mode k8s
```

Useful examples from the repository root:

Run the API directly with Node.js:

```powershell
.\scripts\dev-up.ps1 -Mode local
```

Run the Docker version locally with the mock provider:

```powershell
.\scripts\dev-up.ps1 -Mode docker
```

Run the Docker version locally with Ollama:

```powershell
.\scripts\dev-up.ps1 -Mode docker -Provider ollama
```

Build and deploy the Kubernetes version for the current local context:

```powershell
.\scripts\dev-up.ps1 -Mode k8s
```

Before using `k8s-port-forward`, stop any local Node.js process or Docker container already bound to port `3000`.
The Kubernetes deploy flow now waits for the deployment rollout to finish before returning control.

Open local access to the Kubernetes service:

```powershell
.\scripts\k8s-port-forward.ps1
```

This command now waits for the pod to become `Ready` before opening the port-forward.
By default it uses local port `3001` to avoid conflicts with local Node.js or Docker runs that usually use `3000`.

Delete the local Kubernetes namespace when you want to clean up:

```powershell
.\scripts\dev-down.ps1 -Mode k8s
```

If you want to stop the Docker local container started through the helper flow:

```powershell
.\scripts\dev-down.ps1 -Mode docker
```

Validate the currently running mode with smoke checks:

```powershell
.\scripts\dev-test.ps1 -Mode local
.\scripts\dev-test.ps1 -Mode docker
.\scripts\dev-test.ps1 -Mode k8s
```

If you also want the baseline Playwright suites after the smoke checks:

```powershell
.\scripts\dev-test.ps1 -Mode local -IncludeSuites
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

The current heuristic checks now cover:

- expected provider used
- expected source document
- minimum answer length
- required terms
- optional-term threshold
- forbidden terms

Run from the `app` folder after starting the API:

```bash
npm run eval:ask
```

This command expects the API to already be running locally.

The same evaluation dataset can also run through Playwright:

```bash
npm run test:llm
```

This option starts the API automatically and is the most convenient way to execute the current LLM evaluation suite.

For a deterministic local run that mirrors CI, use:

```bash
npm run test:llm:mock
```

This variant runs the same evaluation layer against the `mock` provider with a CI-friendly dataset.

## CI

The repository includes a GitHub Actions workflow that now runs three baseline checks automatically on pushes and pull requests:

- Playwright API tests
- deterministic LLM evaluation with the `mock` provider
- Docker image build validation
