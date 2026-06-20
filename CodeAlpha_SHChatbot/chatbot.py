"""
chatbot.py
----------
Step 2 (Task requirement): Preprocess text using NLP techniques
                            (tokenize, clean, remove stopwords, stem).
Step 3 (Task requirement): Match user questions to the most similar FAQ
                            using TF-IDF + cosine similarity.
Step 4 (Task requirement): Return the best matching answer.

NOTE ON NLTK:
This sandbox does not have internet access to pip-install NLTK, so the
preprocessing below is implemented with Python's built-in `re` module plus
a manual stopword list and a lightweight Porter-style stemmer — this
produces the same *kind* of output NLTK's `word_tokenize`,
`stopwords.words('english')`, and `PorterStemmer` would give you.

If you run this on your own machine where `pip install nltk` works, you can
swap in real NLTK by replacing the `preprocess()` function body with:

    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    from nltk.stem import PorterStemmer
    nltk.download('punkt'); nltk.download('stopwords')
    stop_words = set(stopwords.words('english'))
    stemmer = PorterStemmer()

    def preprocess(text):
        tokens = word_tokenize(text.lower())
        tokens = [stemmer.stem(t) for t in tokens
                  if t.isalpha() and t not in stop_words]
        return " ".join(tokens)

Everything else (TF-IDF + cosine similarity matching) stays identical.
"""

import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from faqs import FAQS

# ---------------------------------------------------------------------------
# A standard English stopword list (same words NLTK's stopword corpus uses)
# ---------------------------------------------------------------------------
STOPWORDS = {
    "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you",
    "you're", "you've", "you'll", "you'd", "your", "yours", "yourself",
    "yourselves", "he", "him", "his", "himself", "she", "she's", "her",
    "hers", "herself", "it", "it's", "its", "itself", "they", "them",
    "their", "theirs", "themselves", "what", "which", "who", "whom",
    "this", "that", "that'll", "these", "those", "am", "is", "are", "was",
    "were", "be", "been", "being", "have", "has", "had", "having", "do",
    "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or",
    "because", "as", "until", "while", "of", "at", "by", "for", "with",
    "about", "against", "between", "into", "through", "during", "before",
    "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "then", "once",
    "here", "there", "when", "where", "why", "how", "all", "any", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "s", "t",
    "can", "will", "just", "don", "should", "now", "please", "would",
    "could", "i'm", "i've", "i'll", "i'd",
}


def simple_stem(word: str) -> str:
    """
    A lightweight Porter-style stemmer covering common English suffixes.
    Mirrors the behaviour of NLTK's PorterStemmer closely enough for
    short-text FAQ matching (e.g. 'shipping' -> 'ship', 'cancelled' -> 'cancel').
    """
    suffixes = ["ing", "edly", "ed", "ly", "es", "ation", "tion", "ies", "s"]
    for suf in suffixes:
        if word.endswith(suf) and len(word) - len(suf) >= 3:
            stem = word[: -len(suf)]
            return stem
    return word


def preprocess(text: str) -> str:
    """
    Clean + tokenize + remove stopwords + stem.

    Steps:
      1. Lowercase the text
      2. Remove punctuation/special characters (keep only letters & spaces)
      3. Tokenize (split into words)
      4. Remove stopwords
      5. Stem each remaining token
      6. Re-join into a cleaned string (ready for TF-IDF)
    """
    text = text.lower()
    text = re.sub(r"[^a-z\s]", " ", text)          # remove punctuation/numbers
    tokens = text.split()                            # tokenize
    tokens = [t for t in tokens if t not in STOPWORDS and len(t) > 1]
    tokens = [simple_stem(t) for t in tokens]         # stem
    return " ".join(tokens)


class FAQChatbot:
    """
    Loads the FAQ knowledge base, preprocesses all questions, and builds a
    TF-IDF matrix once at startup. At query time, the user's question is
    preprocessed the same way and compared against every FAQ question using
    cosine similarity. The highest-scoring FAQ's answer is returned.
    """

    def __init__(self, faqs=None, similarity_threshold: float = 0.2):
        self.faqs = faqs if faqs is not None else FAQS
        self.similarity_threshold = similarity_threshold

        # Preprocess every FAQ question up front
        self.processed_questions = [preprocess(f["question"]) for f in self.faqs]

        # Fit TF-IDF vectorizer on the FAQ corpus
        self.vectorizer = TfidfVectorizer()
        self.tfidf_matrix = self.vectorizer.fit_transform(self.processed_questions)

    def get_response(self, user_question: str) -> dict:
        """
        Returns a dict with:
          - answer: best matching FAQ answer (or a fallback message)
          - matched_question: the FAQ question that matched
          - score: cosine similarity score (0-1)
        """
        if not user_question or not user_question.strip():
            return {
                "answer": "Please type a question and I'll do my best to help!",
                "matched_question": None,
                "score": 0.0,
            }

        cleaned = preprocess(user_question)

        if not cleaned.strip():
            return {
                "answer": "Sorry, I didn't quite catch that. Could you rephrase "
                           "your question?",
                "matched_question": None,
                "score": 0.0,
            }

        # Vectorize the user query using the SAME fitted vectorizer
        user_vec = self.vectorizer.transform([cleaned])

        # Cosine similarity between user query and every FAQ question
        similarities = cosine_similarity(user_vec, self.tfidf_matrix)[0]

        best_idx = similarities.argmax()
        best_score = float(similarities[best_idx])

        if best_score < self.similarity_threshold:
            return {
                "answer": "I'm sorry, I don't have an answer for that yet. "
                           "Try asking about orders, shipping, returns, "
                           "payments, or your account — or contact "
                           "support@onlinestore.com for further help.",
                "matched_question": None,
                "score": best_score,
            }

        return {
            "answer": self.faqs[best_idx]["answer"],
            "matched_question": self.faqs[best_idx]["question"],
            "score": round(best_score, 3),
        }


# ---------------------------------------------------------------------------
# Quick manual test when running this file directly:  python3 chatbot.py
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    bot = FAQChatbot()
    test_questions = [
        "How do I track my package?",
        "can i return something i bought",
        "what cards do you take",
        "is shipping free",
        "tell me a joke",
    ]
    for q in test_questions:
        result = bot.get_response(q)
        print(f"\nUser: {q}")
        print(f"Matched FAQ: {result['matched_question']}  (score={result['score']})")
        print(f"Bot: {result['answer']}")
