from flask import Flask, request, jsonify
from flask_cors import CORS
import pytesseract
from PIL import Image, ImageDraw, ImageFont
import whisper
import tempfile
import base64
import os
from transformers import pipeline
from io import BytesIO
from textwrap import wrap
from dotenv import load_dotenv
import wolframalpha
import re
from sympy import sympify
from sympy.core.sympify import SympifyError


load_dotenv()

app = Flask(__name__)
CORS(app)


# Get App ID from .env
WOLFRAM_APP_ID = os.getenv('WOLFRAMALPHA_APP_ID')
# Initialize WolframAlpha client
client = wolframalpha.Client(WOLFRAM_APP_ID)


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

        summary = summarizer(original_text, max_length=150, min_length=40, do_sample=False)
        return jsonify({'summary': summary[0]['summary_text']})
    except Exception as e:
        print(f"❌ Summarization error: {str(e)}")
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/handwritten', methods=['POST'])
def text_to_handwritten():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400

    text = data['text']
    font_name = data.get('font', 'Caveat-VariableFont_wght.ttf')
    font_path = os.path.join(os.path.dirname(__file__), 'fonts', font_name)

    try:
        # Set image size large enough
        img_width = 600
        max_chars_per_line = 43  # You can tune this value

        try:
            font = ImageFont.truetype(font_path, 36)
        except IOError:
            print(f"⚠️ Font '{font_name}' not found. Using default font instead.")
            font = ImageFont.load_default()

        # Wrap text
        wrapped_lines = wrap(text, width=max_chars_per_line)
        # Create a temporary ImageDraw object to calculate text height
        dummy_img = Image.new('RGB', (1,1))
        draw = ImageDraw.Draw(dummy_img)

        bbox = draw.textbbox((0, 0), 'A', font=font)
        line_height = (bbox[3] - bbox[1]) + 10  # height + padding

        img_height = 100 + line_height * len(wrapped_lines)

        img = Image.new('RGB', (img_width, img_height), color='white')
        draw = ImageDraw.Draw(img)

        # Draw each line
        y = 50
        for line in wrapped_lines:
            draw.text((40, y), line, font=font, fill='black')
            y += line_height

        # Return as base64
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

        return jsonify({'image_base64': img_str})

    except Exception as e:
        print(f"❌ Error generating handwritten image: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/mathsolve', methods=['POST'])
def solve_expression():
    data = request.json
    expression = data.get('expression')

    if not expression:
        return jsonify({'error': 'No expression provided'}), 400

    try:
        expression = expression.replace("^", "**")
        expression = re.sub(r'\b0+(\d)', r'\1', expression)

        result = sympify(expression)

        # Format result: int if possible, else float
        if result.is_number and result == int(result):
            result = int(result)
        else:
            result = float(result.evalf())

        return jsonify({'result': str(result)})

    except (SympifyError, TypeError, ValueError, ZeroDivisionError) as e:
        print(f"❌ Expression Error: {str(e)}")
        return jsonify({'error': 'Invalid mathematical expression'}), 400


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5050, debug=True)
