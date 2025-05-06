from flask import Flask, request, jsonify, send_file
from gtts import gTTS
import io
import logging
from flask_cors import CORS
import tempfile
import os

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/text-to-speech": {"origins": ["http://localhost:3000", "http://127.0.0.1:3000"]},
    r"/ocr": {"origins": "*"}
}) # Enable CORS for all routes

@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return jsonify({"error": "No text provided"}), 400
        
        text = data["text"].strip()
        if not text:
            return jsonify({"error": "Empty text provided"}), 400

        # Create in-memory file
        mp3_fp = io.BytesIO()
        tts = gTTS(text=text, lang="en")
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)  # Rewind to start of file

        # Return as proper audio response
        return send_file(
            mp3_fp,
            mimetype="audio/mpeg",
            as_attachment=True,
            download_name="speech.mp3"
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=6000, debug=True)