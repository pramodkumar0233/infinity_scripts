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
import traceback


load_dotenv()

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

        summary = summarizer(original_text, max_length=150, min_length=40, do_sample=False)
        return jsonify({'summary': summary[0]['summary_text']})
    except Exception as e:
        print(f"❌ Summarization error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/options', methods=['GET'])
def get_options():
    fonts = [os.path.splitext(f)[0] for f in os.listdir('fonts') if f.endswith('.ttf')]
    papers = [os.path.splitext(p)[0] for p in os.listdir('papers') if p.endswith('.png')]

    return jsonify({'fonts': fonts, 'papers': papers})

    
@app.route('/api/handwritten', methods=['POST'])
def generate_handwritten():
    data = request.json
    text = data['text']
    font_name = data['font']
    font_size = int(data['fontSize'])
    ink_color = data['color']
    paper_type = data['paper']

    try:
        font_path = f'fonts/{font_name}.ttf'
        paper_path = f'papers/{paper_type}.png'

        # Load font and background paper
        font = ImageFont.truetype(font_path, font_size)
        base_paper = Image.open(paper_path).convert("RGB")

        # Setup draw parameters
        x_start, y_start = 20, 40
        margin_left = 20
        margin_right = 20
        max_width = base_paper.width - margin_left - margin_right
        draw_temp = ImageDraw.Draw(base_paper.copy())
        line_bbox = draw_temp.textbbox((0, 0), "A", font=font)
        line_height = line_bbox[3] - line_bbox[1] + 2

        # Preserve indentation and handle newlines
        paragraphs = text.split('\n')
        lines = []
        for para in paragraphs:
            words = para.split()
            line = ""
            indent = len(para) - len(para.lstrip(' '))
            space_prefix = " " * indent
            for word in words:
                test_line = f"{line} {word}".strip()
                if draw_temp.textlength(space_prefix + test_line, font=font) <= max_width:
                    line = test_line
                else:
                    lines.append(space_prefix + line)
                    line = word
            if line:
                lines.append(space_prefix + line)
            lines.append("")  # empty line for new paragraph

        # Write to pages
        pages = []
        page = base_paper.copy()
        draw = ImageDraw.Draw(page)
        x, y = x_start, y_start

        for line in lines:
            if y + line_height > page.height - 10:
                # Page full, save and start new one
                pages.append(page)
                page = base_paper.copy()
                draw = ImageDraw.Draw(page)
                y = y_start
            draw.text((x, y), line, font=font, fill=ink_color)
            y += line_height

        pages.append(page)  # add last page

        # Convert all pages to base64 images
        image_list_base64 = []
        for p in pages:
            buffer = BytesIO()
            p.save(buffer, format="PNG")
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            image_list_base64.append(image_base64)

        return jsonify({'images': image_list_base64})

    except Exception as e:
        print("Error occurred:", str(e))
        traceback.print_exc()
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
