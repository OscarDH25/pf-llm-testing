# Tests

This folder contains the automated test suites for the project.

Current areas:

- API testing

Planned later:

- end-to-end validation
- LLM evaluation
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
