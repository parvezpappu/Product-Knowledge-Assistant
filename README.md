# Product Knowledge Assistant

A grounded product-catalogue assistant built with Node.js, Express, and Google Gemini. It converts the supplied Excel spreadsheet into a persistent embedding knowledge base and exposes one endpoint that answers product questions without inventing products or catalogue details.

The central safety rule is simple: if the requested product cannot be supported by the spreadsheet, the API returns `found: false` and does not call the chat model.

## Features

- Reads and validates the supplied `Products` Excel sheet.
- Normalizes messy text, prices, categories, currencies, stock values, and dates.
- Resolves regular price versus sale price through an `effectivePrice` field.
- Skips invalid and duplicate product rows with log messages.
- Generates and persists one 768-dimensional embedding per product.
- Retrieves products with cosine similarity in plain JavaScript.
- Combines semantic similarity with deterministic brand/model identity checks.
- Handles misspelled real-product queries while rejecting nonexistent nearby models.
- Grounds chat answers only in the matched spreadsheet records.
- Rejects unsupported policy questions before retrieval, saving API calls and quota.
- Includes offline automated tests, a live retrieval evaluation, a Postman collection, and reviewer screenshots.

## Architecture

```text
data/products_data.xlsx
        |
        v
readExcel.js
        |
        v
normalizeProducts.js
        |
        v
removeDuplicates.js
        |
        +--> data/clean-products.json
        |
        v
productToText.js
        |
        v
Gemini embedding API
        |
        v
data/knowledge-base.json

POST /ask
        |
        v
request validation
        |
        v
unsupported-intent guard
        |
        v
question embedding
        |
        v
cosine Top-K retrieval
        |
        v
threshold + product identity decision
        |
        +--> rejected: found:false; chat is not called
        |
        v
matched product records + grounded Gemini chat
        |
        v
{ found:true, answer:"..." }
```

## Project Structure

```text
product-knowledge-assistant/
├── data/
│   ├── products_data.xlsx
│   ├── clean-products.json
│   └── knowledge-base.json
├── docs/
│   └── screenshots/
│       ├── found/
│       └── not-found/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── index.html
├── postman/
│   └── Product-Knowledge-Assistant.postman_collection.json
├── src/
│   ├── ai/
│   │   ├── embeddings.js
│   │   ├── chat.js
│   │   ├── prompts.js
│   │   └── test-chat.js
│   ├── ingestion/
│   │   ├── readExcel.js
│   │   ├── normalizeProducts.js
│   │   ├── removeDuplicates.js
│   │   ├── productToText.js
│   │   └── ingest.js
│   ├── retrieval/
│   │   ├── normalizeSearchText.js
│   │   ├── extractSearchTokens.js
│   │   ├── extractModelTokens.js
│   │   ├── knownBrands.js
│   │   ├── cosineSimilarity.js
│   │   ├── retrieveProducts.js
│   │   ├── identityMatcher.js
│   │   ├── retrievalDecision.js
│   │   ├── classifyQuestionIntent.js
│   │   └── test-retrieval.js
│   ├── routes/
│   │   └── ask.js
│   ├── services/
│   │   └── askServices.js
│   ├── utils/
│   │   ├── parsePrice.js
│   │   └── providerErrors.js
│   ├── app.js
│   └── server.js
├── tests/
│   ├── normalization.test.js
│   ├── retrieval.test.js
│   └── api.test.js
├── .env.example
├── package.json
├── vite.config.mjs
└── README.md
```

## Requirements

- Node.js 22.12 or newer is recommended for both the backend and Vite frontend
- npm
- A live Gemini API key
- Internet access for question embeddings and grounded chat calls

No local model server, vector database, or additional external service is required.

## Setup on a Clean Machine

```bash
git clone https://github.com/parvezpappu/Product-Knowledge-Assistant.git
cd Product-Knowledge-Assistant
npm install
```

Copy `.env.example` to `.env`:

```powershell
Copy-Item .env.example .env
```

On macOS/Linux:

```bash
cp .env.example .env
```

Add a working Gemini key to `.env`:

```env
GEMINI_API_KEY=your_live_gemini_api_key
EMBEDDING_MODEL=gemini-embedding-2
EMBEDDING_DIMENSIONS=768
CHAT_MODEL=gemini-3.5-flash-lite
PORT=3000
```

### Environment Variables

| Variable | Required | Purpose |
|---|---:|---|
| `GEMINI_API_KEY` | Yes | Authenticates embedding and chat requests. |
| `EMBEDDING_MODEL` | No | Embedding model; defaults to `gemini-embedding-2`. |
| `EMBEDDING_DIMENSIONS` | No | Stored vector size; defaults to `768`. Must match the committed knowledge base. |
| `CHAT_MODEL` | No | Grounded-answer model; defaults to `gemini-3.5-flash-lite`. |
| `PORT` | No | Express port; defaults to `3000`. |

The public repository intentionally excludes `.env`. A working task-specific `.env` must be sent separately with the submission, as required by the brief. Use a throwaway free-tier key and revoke it after the review period.

## Start the API

The built knowledge base is committed, so ingestion is not required before normal use:

```bash
npm start
```

Expected output:

```text
Product Knowledge Assistant is running on port 3000.
```

Development mode with automatic restart:

```bash
npm run dev
```

## Optional React Frontend

A small React and Tailwind CSS interface is included in `frontend/`. It provides a single question field, loading feedback, and distinct found, not-found, and request-error states. The backend remains the required deliverable; the UI uses the existing API contract without changing it.

Keep the backend running in the first terminal:

```bash
npm start
```

Start the frontend from the project root in a second terminal:

```bash
npm run frontend:dev
```

Open:

```text
http://localhost:5173
```

During local development, Vite proxies `/api/ask` to the Express endpoint at `http://localhost:3000/ask`, so no backend CORS configuration is required. This localhost address connects only the optional browser UI to the local Express server. Product embeddings and grounded answers use the hosted Gemini API; the project does not require a locally hosted AI model or any separate localhost service. React, Tailwind CSS, and Vite are managed by the single root `package.json`; `frontend/` contains UI source only.

## Build the Knowledge Base

The ingestion command expects the spreadsheet at:

```text
data/products_data.xlsx
```

The workbook must contain a sheet named `Products`. Run:

```bash
npm run ingest
```

The command performs the following steps:

1. Reads the Excel rows with SheetJS (`xlsx`).
2. Normalizes every row into a consistent product object.
3. Skips invalid rows missing a product ID or name.
4. Keeps the first row for each product ID and logs later duplicates.
5. Writes `data/clean-products.json`.
6. Creates searchable text from product name, brand, category, and description.
7. Generates product embeddings sequentially.
8. Writes the product records, embedding text, vectors, and metadata to `data/knowledge-base.json`.

Ingestion is a separate process. It never runs automatically during server startup or an `/ask` request.

## Spreadsheet Problems and Normalization Decisions

The supplied sheet contains 31 raw rows. Normalization and deduplication produce 30 persisted products.

| Data problem found | Handling |
|---|---|
| Duplicate product ID `P-1017` | The first valid row is kept; the duplicate is skipped and logged. |
| 21 blank sale-price cells | `salePrice` becomes `null`; `effectivePrice` falls back to `productPrice`. |
| Prices stored as both numbers and formatted text | Currency symbols, commas, and surrounding text are removed, then the result is validated as a finite number. Invalid formats become `null`. |
| Mixed category capitalization and spelling, such as `Power Bank`, `power bank`, `SPEAKER`, and `Smart Watch` | Categories are trimmed and lowercased; `smart watch` is canonicalized to `smartwatch`. |
| Mixed brand capitalization | Brands are trimmed and lowercased for consistent search identity. |
| Mixed currencies such as `BDT`, `bdt`, and `USD` | Currency codes are trimmed and uppercased. No currency conversion is performed. |
| Stray surrounding whitespace | Text fields are trimmed; whitespace-only optional fields become `null`. |
| Blank or invalid stock values | Valid numeric values become numbers; missing or malformed values become `null`. |
| Date strings and possible Excel serial dates | Valid values are converted to `YYYY-MM-DD`; invalid values become `null`. |
| Missing ID or product name | The row is unusable, so it is skipped with an explicit log message. |

Product data is never hardcoded into runtime source files; all catalogue records come from the spreadsheet and persisted knowledge base.

## Provider Choices

### Embeddings: Google Gemini

`gemini-embedding-2` is used through the hosted Gemini API because it requires no local model download or extra service, works with the same API key as chat, supports configurable output dimensions, and fits the task's free hosted-provider requirement. Product and question embeddings use the same model and dimensionality.

Every stored vector is validated to ensure it:

- is an array;
- has exactly 768 dimensions;
- contains only finite numeric values.

### Chat: Google Gemini 3.5 Flash-Lite

The final chat model is `gemini-3.5-flash-lite`, configurable through `CHAT_MODEL`. It is optimized for low-latency, cost-effective, high-throughput execution, which fits this endpoint's narrow task: turn a small set of already-retrieved product records into a concise answer. Complex product-existence reasoning is intentionally handled by deterministic JavaScript retrieval safeguards before chat is called, so a larger agentic model is unnecessary here.

`gemini-3.7-flash` was evaluated first, but the task project's available free quota was exhausted after a small number of test requests. Switching the chat step to Flash-Lite provided a more practical submission configuration while preserving correct grounded answers. Provider quotas remain project-specific, so the model stays environment-configurable. See the [official Gemini 3.5 Flash-Lite model documentation](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite).

The chat model does not decide whether a product exists. Deterministic retrieval logic makes that decision first. Chat is called only after acceptance and receives only the matched product records, not the full catalogue.

## Rate-Limit Handling

The catalogue is embedded sequentially rather than with a large burst of parallel requests. Both embedding and chat calls retry temporary `429` and server errors up to three attempts using exponential delays of 1 second and 2 seconds.

Daily quota exhaustion is not repeatedly retried. It is converted into HTTP `503 Service Unavailable`:

```json
{
  "found": false,
  "answer": "The AI service has reached its current usage limit. Please try again later."
}
```

The Gemini API does not expose a reliable remaining-request count, so the application does not display a misleading local quota estimate.

## `POST /ask`

### Request

```http
POST http://localhost:3000/ask
Content-Type: application/json
```

```json
{
  "question": "What is the warranty on the Amazfit Bip 5?"
}
```

Questions must be non-empty strings no longer than 500 characters.

### Found Response

```json
{
  "found": true,
  "answer": "The warranty on the Amazfit Bip 5 Smartwatch is 12 Months."
}
```

### Not-Found Response

```json
{
  "found": false,
  "answer": "Sorry, no matching products were found in our catalogue."
}
```

Known brands paired with unknown models receive a more specific response:

```json
{
  "found": false,
  "answer": "Sorry, that exact product model is not available in our catalogue."
}
```

Unsupported store-policy questions are rejected before embedding or retrieval:

```json
{
  "found": false,
  "answer": "Sorry, I can only answer questions using the supplied product catalogue."
}
```

### Validation Error

An empty or non-string question returns HTTP `400`:

```json
{
  "found": false,
  "answer": "Question must be a non-empty string."
}
```

Malformed JSON also returns HTTP `400`, and unknown endpoints return HTTP `404`.

## Retrieval and Confidence Decision

For every supported question, the service:

1. Generates a question embedding.
2. Calculates cosine similarity against all persisted product vectors.
3. Sorts the candidates and returns the top three.
4. Builds product identity evidence from normalized names, catalogue-derived brands, and model-like tokens.
5. Rejects a known brand paired with an unknown model.
6. Applies the semantic threshold.
7. Calls chat only when the final decision is accepted.

Known brands are derived dynamically from `knowledge-base.json`; names such as Anker, Baseus, or JBL are not hardcoded in production retrieval logic.

### Threshold Selection

The initial cosine-only evaluation showed that no clean threshold could separate all valid and invalid questions:

- Lowest expected-found score: `0.7010` for `Which is the cheapest smartwatch you have?`
- Highest expected-not-found score: `0.7463` for `Give me the link for the JBL Go 4.`

The invalid nearby-model query scored higher than a valid catalogue-wide query. Therefore, choosing a simple value such as `0.70` or `0.74` would either reject valid catalogue questions or accept nonexistent models.

The final default threshold is `0.6684`, combined with these identity safeguards:

- normalized exact product-name containment;
- brand detection built from the catalogue;
- model tokens such as `D99`, `P3`, `Bip 5`, `Go 4`, and `10000mAh`;
- known-brand/unknown-model conflict rejection;
- pre-retrieval rejection for explicitly unsupported policy intent.

The final 18-question live evaluation produced `18/18` correct accept/reject decisions. It included normal products, catalogue-wide questions, price filters, misspellings, unrelated categories, unknown products, known brands with nonexistent models, and a question containing no product.

Run the live evaluation with a configured API key:

```bash
npm run test:retrieval-live
```

## Grounding Rules

The system prompt requires all of the following:

- Answer only from product records supplied in the current request.
- Never use outside product knowledge.
- Never invent a product, price, sale price, currency, stock value, warranty, vendor, color, link, or image URL.
- Copy numeric values and URLs from the supplied records.
- Treat a non-null `salePrice` as the current payable price; otherwise use `productPrice`.
- Interpret positive stock as in stock and zero stock as out of stock.
- State clearly when a requested field is missing.
- Never convert currencies.
- Use only relevant products when multiple matches are supplied.
- Return concise answer text rather than JSON or analysis.

The matched product context includes every catalogue field needed for grounded answers, but it excludes embedding vectors.

## Testing

### Offline Automated Tests

```bash
npm test
```

The offline suite makes no live Gemini calls and currently contains 24 passing tests covering:

- formatted, missing, and malformed prices;
- normalization and effective-price fallback;
- date normalization;
- duplicate and invalid-row removal;
- cosine similarity and input validation;
- search/model token extraction;
- dynamic brand detection;
- valid product identity and known-brand/unknown-model conflict detection;
- policy intent classification;
- Express validation, malformed JSON, `404`, and the pre-retrieval policy guard.

### Live Chat Smoke Test

```bash
npm run test:chat-live
```

This test calls Gemini and verifies that the exact JBL Go 3 product URL from the catalogue appears in the grounded answer.

### Postman Collection

Import:

```text
postman/Product-Knowledge-Assistant.postman_collection.json
```

The collection defines a configurable `baseUrl` variable with a local default of `http://localhost:3000`. It contains 18 requests grouped into Found, Not Found, and Validation cases, including the exact questions listed in the assignment brief. Postman assertions validate status codes, `found`, grounded values, and the exact JBL Go 3 URL.

`localhost` here refers only to the Express server under review. Both AI providers are hosted internet APIs; the project does not use a localhost model service.

## Screenshots

The submission includes four found and four not-found Postman results, exceeding the required minimum of three each.

### Found

- [Amazfit Bip 5 warranty](docs/screenshots/found/01-amazfit-warranty.png)
- [Soundcore Life P3 stock](docs/screenshots/found/02-soundcore-stock.png)
- [Misspelled Anker 10000mAh query](docs/screenshots/found/03-misspelled-anker.png)
- [Cheapest smartwatch catalogue query](docs/screenshots/found/04-cheapest-smartwatch.png)

### Not Found

- [Unknown washing-machine category](docs/screenshots/not-found/01-washing-machine.png)
- [Known Baseus brand with unknown D99 model](docs/screenshots/not-found/02-baseus-unknown-model.png)
- [JBL Go 4 PDF/data mismatch](docs/screenshots/not-found/03-jbl-go-4.png)
- [Unsupported return-policy question](docs/screenshots/not-found/04-return-policy.png)

## Data Mismatch

The task brief lists `Anker PowerCore 20000mAh` and `JBL Go 4` as expected-found products. Neither product exists in either copy of the supplied spreadsheet. The supplied catalogue instead contains:

- `Anker PowerCore 10000mAh Power Bank`
- `JBL Go 3 Portable Speaker`

The brief's primary rule says that products absent from the spreadsheet must never be invented. The API therefore returns `found: false` for the 20000mAh model and JBL Go 4. Equivalent real-product cases test the 10000mAh Anker power bank and JBL Go 3 successfully. The Postman collection labels the conflicting brief examples as PDF/data mismatch cases.

## Known Limitations and Future Improvements

- The JSON knowledge base is loaded into memory and cosine similarity scans all products. This is appropriate for 30 products but should be replaced or indexed for a very large catalogue.
- Policy intent detection is deliberately small and rule-based. It does not cover every paraphrase or language.
- Exact catalogue brand detection prevents substring errors but may not recognize a heavily misspelled brand for deterministic conflict analysis; semantic embeddings still provide typo tolerance for real products.
- The threshold is tied to the current catalogue, embedding model, and dimensions. It must be re-evaluated if any of these change.
- Ingestion regenerates every product embedding. A future version could hash normalized records and re-embed only changed products.
- Repeated identical questions are not cached.
- Follow-up questions do not use conversation history.
- Provider quota and availability remain external dependencies.
- Persistence uses synchronous JSON file operations because the dataset is small; larger workloads would benefit from streaming or a database.

With more time, the next priorities would be mocked provider integration tests, configurable debug output for matched scores, incremental embedding updates, a bounded question cache, and multilingual intent safeguards.

## Final Submission Checklist

- [x] Public source repository
- [x] Committed built knowledge base
- [x] Separate ingestion command
- [x] `POST /ask` with validation and consistent responses
- [x] Threshold evaluation and documented justification
- [x] Postman collection
- [x] At least three found and three not-found screenshots
- [x] Committed `.env.example`
- [ ] Send a live task-specific `.env` separately; never commit it to the public repository
- [ ] Perform one final clean-clone installation and request before submission
