# LLM response evaluation

This directory contains the first response-quality checks for the `POST /ask` endpoint.

The current approach is intentionally simple:

- send a small set of representative questions to the API
- inspect the real response body
- apply deterministic heuristic checks

Current checks include:

- expected HTTP status
- non-empty answer for success cases
- expected source document
- required terms present in the answer
- forbidden terms absent from the answer

Run from the `app` folder after starting the API:

```bash
npm run eval:ask
```

By default the script targets:

```bash
http://127.0.0.1:3000
```

To point it to another URL:

```bash
set EVAL_API_BASE_URL=http://127.0.0.1:3000
npm run eval:ask
```
