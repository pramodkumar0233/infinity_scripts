const Tesseract = require("tesseract.js");
const path = require("path");

exports.extractTextFromImage = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const imagePath = path.resolve(__dirname, "..", "uploads", req.file.filename);

  try {
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng");

    res.json({ extractedText: text });
  } catch (err) {
    console.error("OCR Error:", err.message);
    res.status(500).json({ error: "OCR failed" });
  }
};
