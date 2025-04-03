from flask import Flask, render_template, request, jsonify
import requests
import os
from transformers import pipeline

# Initialize Flask app
app = Flask(__name__, template_folder="frontend", static_folder="backend")

# Load API key securely
OPENROUTER_API_KEY = "Your-API-Key"


OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Load Hugging Face models
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
sentiment_analyzer = pipeline("sentiment-analysis")

# 📌 Routes for rendering pages
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/summarize")
def summarize():
    return render_template("summarize.html")

@app.route("/sentiment")
def sentiment():
    return render_template("sentiment.html")

@app.route("/recommend")
def recommend():
    return render_template("recommend.html")

# 🔍 Sentiment Analysis API (Using Hugging Face)
@app.route("/analyze_sentiment", methods=["POST"])
def analyze_sentiment():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Text input is required"}), 400

    try:
        result = sentiment_analyzer(text)
        return jsonify({"text": text, "sentiment": result[0]})
    except Exception as e:
        return jsonify({"error": f"Sentiment Analysis Error: {str(e)}"}), 500

# 📜 Summarization API (Using Hugging Face)
@app.route("/get_summary", methods=["POST"])
def get_summary():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "Text input is required"}), 400

    try:
        summary = summarizer(text, max_length=150, min_length=50, do_sample=False)
        return jsonify({"original_text": text, "summary": summary[0]['summary_text']})
    except Exception as e:
        return jsonify({"error": f"Summarization Error: {str(e)}"}), 500


@app.route("/get_recommendations", methods=["POST"])
def get_recommendations():
    try:
        data = request.json
        user_preference = data.get("preference", "").strip()

        print(f"Received preference: {user_preference}")  # Debug log

        if not user_preference:
            return jsonify({"error": "Preference is required"}), 400

        # Get AI-based recommendations
        recommendations = generate_recommendations(user_preference)

        if not recommendations:
            print("No recommendations found")  # Debug log
            return jsonify({"recommendations": []})  # Return an empty list

        print(f"Returning recommendations: {recommendations}")  # Debug log
        return jsonify({"recommendations": recommendations})

    except Exception as e:
        print(f"Error: {str(e)}")  # Debug log
        return jsonify({"error": str(e)}), 500

def generate_recommendations(user_preference):
    """
    AI-based recommendation system using Google Gemini (via OpenAI API).
    """
    try:
        prompt = f"Suggest 5 recommendations related to {user_preference}. Provide them as a numbered list."

        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-2.0-flash-thinking-exp:free",
                "messages": [
                    {"role": "system", "content": "You are an AI-powered recommendation assistant. Provide a structured list of recommendations without bullet points, formatted like this:\n\nTitle: [Book Name]\nAuthor: [Author Name]\nDescription: [Short summary]\n\nAvoid markdown or special formatting."},
                    {"role": "user", "content": f"Recommend some top {user_preference}."}
                ],
                "temperature": 0.8
            }
        )

        if response.status_code != 200:
            print(f"API Error: {response.status_code} - {response.text}")
            return []

        response_data = response.json()
        ai_response = response_data["choices"][0]["message"]["content"]
        recommendations = [line.split(". ", 1)[-1] for line in ai_response.split("\n") if line]

        print(f"AI Recommendations: {recommendations}")  # Debugging log
        return recommendations

    except Exception as e:
        print(f"AI Error: {str(e)}")
        return []

if __name__ == "__main__":
    app.run(debug=True)
