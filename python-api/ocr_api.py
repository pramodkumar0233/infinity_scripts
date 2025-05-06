from flask import Flask, request, jsonify # type: ignore
import pytesseract # type: ignore
from PIL import Image # type: ignore
import io

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(port=6000)
