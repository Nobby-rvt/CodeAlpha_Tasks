# Translator Backend & StoreHelp FAQ Chatbot

This repository contains two standalone web applications:

1. **[Translator Backend](#1-translator-backend)** — an Express server that proxies translation requests to Google Cloud Translation or Microsoft Translator, keeping API keys secure on the server.
2. **[StoreHelp FAQ Chatbot](#2-storehelp--faq-chatbot)** — a lightweight FAQ chatbot for an online store that matches natural-language questions to answers using NLP and cosine similarity.

Each project is self-contained with its own dependencies, setup steps, and API. Jump to the relevant section below.

---

## 1. Translator Backend

A lightweight Express server that proxies translation requests to **Google Cloud Translation** or **Microsoft Translator (Azure)**, keeping API keys secure on the server instead of exposing them in client-side code. Ships with a complete, ready-to-use frontend.

### Features

- Dual-provider support — Google Cloud Translation and Microsoft Translator, switchable via a single environment variable
- API keys never leave the server — no secrets in browser code or network requests
- Auto language detection alongside manual source/target selection
- Built-in rate limiting and request validation
- Clean, responsive frontend with copy-to-clipboard and text-to-speech
- Zero frontend build step — static HTML/CSS/JS served directly by Express
- Simple REST API that's easy to integrate into other projects

### Tech stack

- **Backend:** Node.js, Express
- **Frontend:** Vanilla HTML, CSS, JavaScript (no framework, no build tooling)
- **Translation providers:** Google Cloud Translation API v2, Microsoft Translator API v3

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- An API key for at least one of:
  - [Google Cloud Translation API](https://console.cloud.google.com/)
  - [Microsoft Translator (Azure Cognitive Services)](https://portal.azure.com/)

### Getting started

#### 1. Clone the repository

```bash
git clone https://github.com/your-username/translator-backend.git
cd translator-backend
```

#### 2. Install dependencies

```bash
npm install
```

#### 3. Configure environment variables

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

#### 4. Run the server

```bash
npm start
```

The app is now running at **http://localhost:3000** — frontend and backend are served from the same Express instance, so there's no CORS configuration needed for local use.

For development with auto-restart on file changes:

```bash
npm run dev
```

### Project structure

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

### API reference

All endpoints are JSON over HTTP.

#### `POST /api/translate`

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

#### `POST /api/detect`

Detects the language of a piece of text.

**Request body**

```json
{ "text": "Guten Tag" }
```

**Response**

```json
{ "provider": "google", "language": "de", "confidence": 1 }
```

#### `GET /api/languages`

Returns the list of languages supported by the active provider. Accepts an optional `?provider=` query parameter to query a specific provider regardless of the default.

#### `GET /api/health`

Returns server and provider status — useful for uptime checks.

```json
{ "status": "ok", "provider": "google" }
```

### Security notes

- API keys are read exclusively from server-side environment variables and are never sent to the client.
- `.env` is excluded from version control via `.gitignore` — never commit real credentials.
- `ALLOWED_ORIGINS` restricts cross-origin requests; update this before deploying publicly.
- Requests are rate-limited per IP (60 requests/minute by default) and capped at 5,000 characters per translation.
- Deploy behind HTTPS in production so translated text isn't transmitted in plaintext.

### Troubleshooting

| Symptom | Likely cause |
|---|---|
| "Backend not reachable" in the UI | Server isn't running, or `index.html` was opened directly from disk instead of via `http://localhost:3000` |
| `"... API key is missing"` | `.env` wasn't created or filled in, or the server needs restarting after editing `.env` |
| `403` / API not enabled (Google) | Cloud Translation API hasn't been enabled on the linked Google Cloud project |
| `401` Unauthorized (Microsoft) | `MICROSOFT_TRANSLATOR_REGION` doesn't match the region of the Azure resource the key belongs to |

### License

Released under the [MIT License](LICENSE).

---

## 2. StoreHelp — FAQ Chatbot

A lightweight FAQ chatbot for an online store that understands natural-language questions and returns the most relevant answer using NLP preprocessing and cosine similarity matching — complete with a web-based chat interface.

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![scikit--learn](https://img.shields.io/badge/scikit--learn-TF--IDF-F7931E?logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

### Overview

StoreHelp answers customer questions about orders, shipping, returns, payments, and account management by matching free-text input against a curated FAQ knowledge base. Rather than relying on rigid keyword rules, it uses **TF-IDF vectorization** and **cosine similarity** to find the closest-matching question semantically, so users don't need to phrase things exactly like the FAQ entry.

**Example:**

| User asks | Matched FAQ | Confidence |
|---|---|---|
| "How do I track my package?" | How can I track my order? | 79% |
| "is shipping free" | Do you offer free shipping? | 79% |
| "what cards do you take" | What payment methods do you accept? | 58% |
| "tell me a joke" | *(no confident match)* | — fallback response |

### Features

- **FAQ knowledge base** — 15 curated question/answer pairs covering common e-commerce support topics
- **NLP preprocessing pipeline** — lowercasing, punctuation stripping, tokenization, stopword removal, and stemming
- **Semantic matching** — TF-IDF vectorization + cosine similarity (scikit-learn) instead of brittle exact-match rules
- **Confidence threshold & fallback** — low-similarity matches return a graceful "I don't know" response instead of a wrong answer
- **REST API** — simple Flask backend exposing `/api/chat` and `/api/faqs`
- **Web chat UI** — responsive HTML/CSS/JS interface with live match confidence shown per response
- **Easily extensible** — add or edit FAQs in one file; no other code changes required

### Demo

```
You:  How do I track my package?
Bot:  You can track your order by logging into your account and going to
      'My Orders'. Click on the order you want to track to see real-time
      shipping status.

      matched: "How can I track my order?"   ▓▓▓▓▓▓▓▓░░ 79%
```

### Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| NLP / matching | scikit-learn (`TfidfVectorizer`, `cosine_similarity`) |
| Preprocessing | Custom tokenizer, stopword filter, and stemmer ([NLTK-compatible](#nltk-compatibility)) |
| Frontend | HTML5, CSS3, vanilla JavaScript |

### Project structure

```
faq_chatbot/
├── app.py              # Flask app — serves the UI and the /api/chat, /api/faqs endpoints
├── chatbot.py           # NLP preprocessing + TF-IDF/cosine similarity matching engine
├── faqs.py                # FAQ knowledge base (question/answer pairs)
├── static/
│   └── index.html           # Chat UI (HTML/CSS/JS)
├── requirements.txt
├── .gitignore
└── README.md
```

### Getting started

#### Prerequisites
- Python 3.9 or higher
- pip

#### Installation

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
pip install -r requirements.txt
```

#### Run

```bash
python3 app.py
```

Then open **http://localhost:5000** in your browser.

#### Run the matcher standalone (no UI)

```bash
python3 chatbot.py
```

This runs a sample set of test questions through the matcher and prints the matched FAQ, similarity score, and answer for each.

### How it works

1. **Collect** — FAQs are stored as question/answer pairs in `faqs.py`.
2. **Preprocess** — Each question (and every user query at runtime) is cleaned: lowercased, stripped of punctuation, tokenized into words, filtered against a stopword list, and stemmed to its root form.
3. **Vectorize** — All preprocessed FAQ questions are converted into a TF-IDF matrix at startup, capturing which words matter most across the knowledge base.
4. **Match** — A user's query is preprocessed and vectorized the same way, then compared against every FAQ vector using cosine similarity.
5. **Respond** — The highest-scoring FAQ's answer is returned. If the best score falls below a confidence threshold (default `0.2`), the bot returns a fallback message instead of guessing.

```
User input
    |
    v
Preprocess (clean -> tokenize -> remove stopwords -> stem)
    |
    v
TF-IDF vectorize
    |
    v
Cosine similarity vs. all FAQ vectors
    |
    v
Best match >= threshold? --No--> Fallback response
    | Yes
    v
Return matched FAQ answer
```

### API reference

#### `POST /api/chat`

Request body:
```json
{ "message": "How do I track my order?" }
```

Response:
```json
{
  "answer": "You can track your order by logging into your account...",
  "matched_question": "How can I track my order?",
  "score": 0.79
}
```

#### `GET /api/faqs`

Returns the full list of FAQ question/answer pairs as JSON.

### Customizing the FAQ knowledge base

Edit the `FAQS` list in `faqs.py` — add, remove, or rewrite entries:

```python
{
    "question": "Do you offer gift wrapping?",
    "answer": "Yes, gift wrapping is available at checkout for $2.99."
}
```

The TF-IDF index is rebuilt automatically from this list each time the app starts. No changes are needed anywhere else.

### NLTK compatibility

This implementation ships with a self-contained tokenizer, stopword filter, and lightweight stemmer so the project runs without external downloads. To use NLTK's `word_tokenize`, `stopwords`, and `PorterStemmer` instead:

```bash
pip install nltk
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

Then swap the `preprocess()` function in `chatbot.py` for the NLTK version documented in that file's module docstring. The TF-IDF and cosine similarity matching logic is unaffected by this change.

### Roadmap

- [ ] Swap TF-IDF for sentence embeddings (e.g. `sentence-transformers`) for deeper semantic matching
- [ ] Multi-turn conversation context
- [ ] Log unmatched/low-confidence queries to surface FAQ gaps
- [ ] Adjustable confidence threshold from the UI
- [ ] Deploy to a public host (Render / Railway / Heroku)

### License

This project is licensed under the MIT License.

### Author

Built as part of an NLP/chatbot coursework assignment (Task 2: Chatbot for FAQs).
