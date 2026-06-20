# Translator Backend

A lightweight Express server that proxies translation requests to **Google Cloud Translation** or **Microsoft Translator (Azure)**, keeping API keys secure on the server instead of exposing them in client-side code. Ships with a complete, ready-to-use frontend.

## Features

- Dual-provider support — Google Cloud Translation and Microsoft Translator, switchable via a single environment variable
- API keys never leave the server — no secrets in browser code or network requests
- Auto language detection alongside manual source/target selection
- Built-in rate limiting and request validation
- Clean, responsive frontend with copy-to-clipboard and text-to-speech
- Zero frontend build step — static HTML/CSS/JS served directly by Express
- Simple REST API that's easy to integrate into other projects

## Tech stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework, no build tooling)
- **Translation providers:** Google Cloud Translation API v2, Microsoft Translator API v3

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- An API key for at least one of:
  - [Google Cloud Translation API](https://console.cloud.google.com/)
  - [Microsoft Translator (Azure Cognitive Services)](https://portal.azure.com/)

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/translator-backend.git
cd translator-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Required |
|---|---|---|
| `TRANSLATION_PROVIDER` | `google` or `microsoft` — selects the active provider | Yes |
| `GOOGLE_TRANSLATE_API_KEY` | API key from Google Cloud Console | If using Google |
| `MICROSOFT_TRANSLATOR_KEY` | Subscription key from Azure Translator resource | If using Microsoft |
| `MICROSOFT_TRANSLATOR_REGION` | Azure resource region (e.g. `eastus`) | If using Microsoft |
| `MICROSOFT_TRANSLATOR_ENDPOINT` | API endpoint, defaults to the standard global endpoint | No |
| `PORT` | Port the server listens on | No (defaults to `3000`) |
| `ALLOWED_ORIGINS` | Comma-separated list of origins allowed via CORS | No |

You can keep credentials for both providers in `.env` simultaneously and switch between them by changing `TRANSLATION_PROVIDER`, or override the provider per-request (see [API Reference](#api-reference)).

<details>
<summary><strong>Setting up a Google Cloud Translation key</strong></summary>

1. Create or select a project in the [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services → Library**, search for **Cloud Translation API**, and enable it.
3. Navigate to **APIs & Services → Credentials → Create Credentials → API key**.
4. Copy the key into `.env` as `GOOGLE_TRANSLATE_API_KEY`.
5. Recommended: restrict the key to the Cloud Translation API under the key's API restrictions.

</details>

<details>
<summary><strong>Setting up a Microsoft Translator key</strong></summary>

1. In the [Azure Portal](https://portal.azure.com/), create a new **Translator** resource.
2. Once provisioned, open the resource and go to **Keys and Endpoint**.
3. Copy the key and region into `.env` as `MICROSOFT_TRANSLATOR_KEY` and `MICROSOFT_TRANSLATOR_REGION`.

</details>

### 4. Run the server

```bash
npm start
```

The app is now running at **http://localhost:3000** — frontend and backend are served from the same Express instance, so there's no CORS configuration needed for local use.

For development with auto-restart on file changes:

```bash
npm run dev
```

## Project structure

```
translator-backend/
├── server.js                   Express app — routes, validation, rate limiting
├── providers/
│   ├── index.js                 Resolves the active provider from environment config
│   ├── googleTranslate.js       Google Cloud Translation API adapter
│   └── microsoftTranslator.js   Microsoft Translator API adapter
├── public/
│   └── index.html                Frontend UI
├── .env.example                 Environment variable template
├── package.json
└── README.md
```

## API reference

All endpoints are JSON over HTTP.

### `POST /api/translate`

Translates text from a source language to a target language.

**Request body**

```json
{
  "text": "Hello, world",
  "source": "en",
  "target": "es"
}
```

`source` may be omitted or set to `"auto"` to auto-detect the source language.

**Response**

```json
{
  "provider": "google",
  "sourceLanguage": "auto",
  "detectedSourceLanguage": "en",
  "targetLanguage": "es",
  "originalText": "Hello, world",
  "translatedText": "Hola, mundo"
}
```

Pass an optional `"provider": "microsoft"` field in the request body to override the default provider for a single call.

### `POST /api/detect`

Detects the language of a piece of text.

**Request body**

```json
{ "text": "Guten Tag" }
```

**Response**

```json
{ "provider": "google", "language": "de", "confidence": 1 }
```

### `GET /api/languages`

Returns the list of languages supported by the active provider. Accepts an optional `?provider=` query parameter to query a specific provider regardless of the default.

### `GET /api/health`

Returns server and provider status — useful for uptime checks.

```json
{ "status": "ok", "provider": "google" }
```

## Security notes

- API keys are read exclusively from server-side environment variables and are never sent to the client.
- `.env` is excluded from version control via `.gitignore` — never commit real credentials.
- `ALLOWED_ORIGINS` restricts cross-origin requests; update this before deploying publicly.
- Requests are rate-limited per IP (60 requests/minute by default) and capped at 5,000 characters per translation.
- Deploy behind HTTPS in production so translated text isn't transmitted in plaintext.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Backend not reachable" in the UI | Server isn't running, or `index.html` was opened directly from disk instead of via `http://localhost:3000` |
| `"... API key is missing"` | `.env` wasn't created or filled in, or the server needs restarting after editing `.env` |
| `403` / API not enabled (Google) | Cloud Translation API hasn't been enabled on the linked Google Cloud project |
| `401` Unauthorized (Microsoft) | `MICROSOFT_TRANSLATOR_REGION` doesn't match the region of the Azure resource the key belongs to |

## License

Released under the [MIT License](LICENSE).
