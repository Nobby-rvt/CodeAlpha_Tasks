# StoreHelp — FAQ Chatbot

A lightweight FAQ chatbot for an online store that understands natural-language questions and returns the most relevant answer using NLP preprocessing and cosine similarity matching — complete with a web-based chat interface.

![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.x-000000?logo=flask&logoColor=white)
![scikit--learn](https://img.shields.io/badge/scikit--learn-TF--IDF-F7931E?logo=scikitlearn&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

StoreHelp answers customer questions about orders, shipping, returns, payments, and account management by matching free-text input against a curated FAQ knowledge base. Rather than relying on rigid keyword rules, it uses **TF-IDF vectorization** and **cosine similarity** to find the closest-matching question semantically, so users don't need to phrase things exactly like the FAQ entry.

**Example:**

| User asks | Matched FAQ | Confidence |
|---|---|---|
| "How do I track my package?" | How can I track my order? | 79% |
| "is shipping free" | Do you offer free shipping? | 79% |
| "what cards do you take" | What payment methods do you accept? | 58% |
| "tell me a joke" | *(no confident match)* | — fallback response |

---

## Features

- **FAQ knowledge base** — 15 curated question/answer pairs covering common e-commerce support topics
- **NLP preprocessing pipeline** — lowercasing, punctuation stripping, tokenization, stopword removal, and stemming
- **Semantic matching** — TF-IDF vectorization + cosine similarity (scikit-learn) instead of brittle exact-match rules
- **Confidence threshold & fallback** — low-similarity matches return a graceful "I don't know" response instead of a wrong answer
- **REST API** — simple Flask backend exposing `/api/chat` and `/api/faqs`
- **Web chat UI** — responsive HTML/CSS/JS interface with live match confidence shown per response
- **Easily extensible** — add or edit FAQs in one file; no other code changes required

---

## Demo

```
You:  How do I track my package?
Bot:  You can track your order by logging into your account and going to
      'My Orders'. Click on the order you want to track to see real-time
      shipping status.

      matched: "How can I track my order?"   ▓▓▓▓▓▓▓▓░░ 79%
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Backend | Python 3, Flask |
| NLP / matching | scikit-learn (`TfidfVectorizer`, `cosine_similarity`) |
| Preprocessing | Custom tokenizer, stopword filter, and stemmer ([NLTK-compatible](#nltk-compatibility)) |
| Frontend | HTML5, CSS3, vanilla JavaScript |

---

## Project structure

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

---

## Getting started

### Prerequisites
- Python 3.9 or higher
- pip

### Installation

```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
pip install -r requirements.txt
```

### Run

```bash
python3 app.py
```

Then open **http://localhost:5000** in your browser.

### Run the matcher standalone (no UI)

```bash
python3 chatbot.py
```

This runs a sample set of test questions through the matcher and prints the matched FAQ, similarity score, and answer for each.

---

## How it works

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

---

## API reference

### `POST /api/chat`

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

### `GET /api/faqs`

Returns the full list of FAQ question/answer pairs as JSON.

---

## Customizing the FAQ knowledge base

Edit the `FAQS` list in `faqs.py` — add, remove, or rewrite entries:

```python
{
    "question": "Do you offer gift wrapping?",
    "answer": "Yes, gift wrapping is available at checkout for $2.99."
}
```

The TF-IDF index is rebuilt automatically from this list each time the app starts. No changes are needed anywhere else.

---

## NLTK compatibility

This implementation ships with a self-contained tokenizer, stopword filter, and lightweight stemmer so the project runs without external downloads. To use NLTK's `word_tokenize`, `stopwords`, and `PorterStemmer` instead:

```bash
pip install nltk
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

Then swap the `preprocess()` function in `chatbot.py` for the NLTK version documented in that file's module docstring. The TF-IDF and cosine similarity matching logic is unaffected by this change.

---

## Roadmap

- [ ] Swap TF-IDF for sentence embeddings (e.g. `sentence-transformers`) for deeper semantic matching
- [ ] Multi-turn conversation context
- [ ] Log unmatched/low-confidence queries to surface FAQ gaps
- [ ] Adjustable confidence threshold from the UI
- [ ] Deploy to a public host (Render / Railway / Heroku)

---

## License

This project is licensed under the MIT License.

## Author

Built as part of an NLP/chatbot coursework assignment (Task 2: Chatbot for FAQs).
