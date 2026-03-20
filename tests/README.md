# Tests

This folder contains the automated test suites for the project.

Current areas:

- API testing
- LLM evaluation

Planned later:

- end-to-end validation
- regression checks

## API tests

The first automated suite uses Playwright as an API test runner.

Current coverage:

- `GET /health`
- `POST /ask` success path
- `POST /ask` validation error
- `POST /ask` empty string validation
- `POST /ask` whitespace-only validation
- `POST /ask` wrong type validation
- `POST /ask` invalid JSON error
- `POST /ask` no-match path

Location:

```bash
app/tests/api
```

Run from the `app` folder:

```bash
npm install
npm run test:api
```

Playwright starts the local API automatically for this suite.

## CI execution

This suite is also executed in GitHub Actions through `.github/workflows/api-tests.yml`.

At the moment the suite runs against the `mock` provider configuration, even if local manual development uses `ollama`.

The mocked responses now include provider metadata so the suite can verify which provider handled the request.

## LLM evaluation

The repository also includes a first evaluation script under:

```bash
app/evals
```

This layer does not replace API tests. Its job is different:

- call the real API
- inspect the generated answer
- apply simple heuristic checks over a controlled dataset

Current heuristics include:

- expected provider used
- expected source document
- minimum answer length
- required terms
- minimum optional-term coverage
- forbidden terms

Run from the `app` folder:

```bash
npm run eval:ask
```

If you want the same evaluation cases to run under Playwright as a test suite:

```bash
npm run test:llm
```
