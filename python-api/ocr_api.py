from flask import Flask, request, jsonify, send_file # type: ignore
from gtts import gTTS # type: ignore
import tempfile
import pytesseract # type: ignore
from PIL import Image # type: ignore
import io
import re
from flask_cors import CORS # type: ignore



pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

app = Flask(__name__)
CORS(app)



@app.route("/text-to-speech", methods=["POST"])
def text_to_speech():
    try:
        data = request.get_json()
        if not data or "text" not in data:
            return {"error": "No text provided"}, 400
        
        text = data["text"]
        tts = gTTS(text=text, lang="en")
        
        # Save to temporary file
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)  # Move to the beginning of the file
        
        # Send the file back
        return send_file(mp3_fp, mimetype="audio/mpeg", as_attachment=True, download_name="speech.mp3")
    except Exception as e:
        return {"error": str(e)}, 500



@app.route("/ocr", methods=["POST"])
def ocr():
    print("[🔄] Received OCR request...")

    try:
        image_file = request.files['image']
        print("[🔍] Reading image for OCR...")
        image = Image.open(io.BytesIO(image_file.read()))

        print("[🧠] Running Tesseract OCR...")
        text = pytesseract.image_to_string(image)

        print("[✅] OCR Success. Text extracted:")
        print(text)

        return jsonify({"text": text})

    except Exception as e:
        print("[❌] OCR processing error:", str(e))
        return jsonify({"error": "OCR processing failed"}), 500





if __name__ == "__main__":
    app.run(port=6000)
