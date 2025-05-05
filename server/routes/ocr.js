// server/routes/ocr.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const Tesseract = require("tesseract.js");
const path = require("path");
const fs = require("fs");

// Multer setup for file uploads
const upload = multer({ dest: "uploads/" });

router.post("/api/ocr", upload.single("image"), async (req, res) => {
  const imagePath = req.file.path;

  try {
    const result = await Tesseract.recognize(imagePath, "eng", {
      logger: m => console.log(m),
    });

    // Delete image after processing to save space
    fs.unlinkSync(imagePath);

    res.json({ text: result.data.text });
  } catch (error) {
    console.error("OCR Error:", error.message);
    res.status(500).json({ error: "OCR failed" });
  }
});

module.exports = router;
