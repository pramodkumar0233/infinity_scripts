const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('image'), async (req, res) => {
  console.log("🔄 OCR route hit");
  
  if (!req.file) {
    console.log("❌ No image uploaded");
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    const formData = new FormData();
    formData.append('image', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    const response = await axios.post('http://127.0.0.1:6000/ocr', formData, {
      headers: formData.getHeaders(),
    });

    console.log("✅ OCR proxy response:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("❌ OCR proxy error:", error.message);
    res.status(500).json({ error: "OCR processing failed" });
  }
});

module.exports = router;
