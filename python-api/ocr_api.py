from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image
import whisper
import tempfile
import os
from transformers import pipeline

app = Flask(__name__)
CORS(app)


print("🧠 Loading summarization model...")
summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
print("✅ Summarization model loaded.")


# Load Whisper once
try:
    print("🧠 Loading Whisper model...")
    model = whisper.load_model("base")
    print("✅ Whisper model loaded.")
except Exception as e:
    print(f"❌ Error loading Whisper model: {e}")
    raise e

@app.route('/api/ocr', methods=['POST'])
def extract_text():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    print(f"Received file: {file.filename}")  # ✅ LOG
    image = request.files['image']
    img = Image.open(image.stream)

    try:
        text = pytesseract.image_to_string(img)
        return jsonify({'text': text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/stt', methods=['POST'])
def speech_to_text():
    print("🔧 Request received at /api/stt")

    if 'audio' not in request.files:
        print("❌ No audio file found in request")
        return jsonify({"error": "No audio file provided"}), 400

    try:
        file = request.files['audio']
        print(f"✅ Audio file received: {file.filename}")

        # Save audio temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
            file.save(temp_audio.name)
            print(f"📁 Saved temp audio file at: {temp_audio.name}")

        # Transcribe using Whisper
        result = model.transcribe(temp_audio.name)
        print("📄 Transcription result:", result["text"])

        # Clean up
        os.remove(temp_audio.name)

        return jsonify({'text': result["text"]})
    except Exception as e:
        print(f"❌ Error during processing: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/summarize', methods=['POST'])
def summarize_text():
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required for summarization'}), 400

    try:
        original_text = data['text']
        print(f"📄 Text to summarize: {original_text[:100]}...")

        summary = summarizer(original_text, max_length=150, min_length=30, do_sample=False)
        return jsonify({'summary': summary[0]['summary_text']})
    except Exception as e:
        print(f"❌ Summarization error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
