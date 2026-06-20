# StoreHelp — FAQ Chatbot (Task 2)

A chatbot that answers FAQs for an **online store** using NLP preprocessing
and cosine-similarity matching, with a web-based chat UI.

## How it maps to the task requirements

| Requirement | Where it's implemented |
|---|---|
| Collect FAQs | `faqs.py` — 15 Q&A pairs covering orders, shipping, returns, payments, account |
| Preprocess text (tokenize, clean) | `chatbot.py` → `preprocess()`: lowercases, strips punctuation, tokenizes, removes stopwords, stems |
| Match user questions (cosine similarity) | `chatbot.py` → `FAQChatbot`: TF-IDF vectorization (scikit-learn) + cosine similarity |
| Display best matching answer | `chatbot.py` → `get_response()`, served via `app.py` → `/api/chat` |
| Simple chat UI | `static/index.html` — full HTML/CSS/JS chat interface |

## Project structure

```
faq_chatbot/
├── faqs.py            # FAQ knowledge base (edit this to add your own FAQs)
├── chatbot.py          # Preprocessing + TF-IDF/cosine similarity matching engine
├── app.py               # Flask backend (serves UI + /api/chat endpoint)
├── static/
│   └── index.html       # Chat UI
├── requirements.txt
└── README.md
```

## Setup & run

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the server:
   ```bash
   python3 app.py
   ```

3. Open your browser to:
   ```
   http://localhost:5000
   ```

You can also test the matching logic alone, without the web UI:
```bash
python3 chatbot.py
```

## Using real NLTK instead of the built-in preprocessor

This sandbox couldn't reach the internet to `pip install nltk`, so
`chatbot.py` ships with a hand-written tokenizer/stopword-remover/stemmer
that behaves the same way NLTK's would for short FAQ-style text.

If you want to use actual NLTK on your own machine:

```bash
pip install nltk
python3 -c "import nltk; nltk.download('punkt'); nltk.download('stopwords')"
```

Then replace the `preprocess()` function in `chatbot.py` with the NLTK
version shown in the comment block at the top of that file. Nothing else
needs to change — the TF-IDF + cosine similarity matching logic is
independent of which tokenizer/stemmer you use.

## How the matching works

1. Every FAQ question is preprocessed once at startup and turned into a
   TF-IDF vector — this builds a "vocabulary" of important words across all
   FAQs.
2. When a user asks a question, it's preprocessed the same way and
   converted into a TF-IDF vector using that same vocabulary.
3. Cosine similarity is computed between the user's vector and every FAQ
   question's vector — this measures how similar the *direction* of the
   word-importance vectors are, regardless of sentence length.
4. The FAQ with the highest similarity score is selected. If the best score
   is below a threshold (0.2), the bot returns a fallback message instead of
   guessing.

## Customizing for your own product

Just edit `FAQS` in `faqs.py` — add/remove/edit question-answer pairs. The
chatbot rebuilds its TF-IDF index automatically from whatever is in that
list, no other code changes needed.

## Extending further (ideas)

- Swap TF-IDF for sentence embeddings (e.g. `sentence-transformers`) for
  better semantic matching beyond keyword overlap.
- Add conversation history / multi-turn context.
- Log unanswered questions to find FAQ gaps.
- Add a confidence threshold slider in the UI.
