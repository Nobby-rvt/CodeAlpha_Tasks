"""
app.py
------
Flask backend that exposes the FAQChatbot via a simple REST API and serves
the chat UI (index.html).

Run with:
    python3 app.py

Then open http://localhost:5000 in your browser.
"""

from flask import Flask, request, jsonify, send_from_directory
from chatbot import FAQChatbot
from faqs import FAQS

app = Flask(__name__, static_folder="static")
bot = FAQChatbot()


@app.route("/")
def home():
    return send_from_directory("static", "index.html")


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}
    user_message = data.get("message", "")

    result = bot.get_response(user_message)
    return jsonify(result)


@app.route("/api/faqs", methods=["GET"])
def list_faqs():
    """Returns all FAQs (useful for showing example questions in the UI)."""
    return jsonify(FAQS)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
