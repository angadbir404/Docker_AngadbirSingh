from datetime import datetime
from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route("/")
def home():
    return jsonify({"status": "Flask backend is running"})


@app.route("/submit", methods=["POST"])
def submit():
    data = request.get_json(silent=True) or {}

    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    message = (data.get("message") or "").strip()

    if not name or not email or not message:
        return jsonify({"error": "name, email and message are all required"}), 400

    # Process the data
    result = {
        "greeting": f"Hello {name.title()}, your form was received by the Flask backend.",
        "name": name.title(),
        "email": email.lower(),
        "message": message,
        "word_count": len(message.split()),
        "char_count": len(message),
        "received_at": datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
    }
    return jsonify(result), 200


if __name__ == "__main__":
    # 0.0.0.0 so the app is reachable from outside the container
    app.run(host="0.0.0.0", port=5000)
