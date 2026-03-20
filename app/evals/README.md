# LLM response evaluation

This directory contains the first response-quality checks for the `POST /ask` endpoint.

The current approach is intentionally simple:

- send a small set of representative questions to the API
- inspect the real response body
- apply deterministic heuristic checks

Current checks include:

- expected HTTP status
- non-empty answer for success cases
- expected provider used
- expected source document
- minimum answer length
- required terms present in the answer
- minimum optional terms present when configured
- forbidden terms absent from the answer

Run from the `app` folder after starting the API manually:

```bash
npm run eval:ask
```

This command expects the API to already be running on `http://127.0.0.1:3000` unless `EVAL_API_BASE_URL` is overridden.

If you want to execute the same evaluation rules through Playwright:

```bash
npm run test:llm
```

This option is more self-contained because Playwright starts the API automatically before the suite runs.

By default the script targets:

```bash
http://127.0.0.1:3000
```

To point it to another URL:

```bash
set EVAL_API_BASE_URL=http://127.0.0.1:3000
npm run eval:ask
```
