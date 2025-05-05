const express = require("express");
const router = express.Router();
const translate = require("google-translate-api-x");

router.post("/api/translate", async (req, res) => {
  const { text, targetLang } = req.body;

  try {
    const result = await translate(text, { to: targetLang });
    res.json({ translatedText: result.text });
  } catch (error) {
    console.error("Translation Error:", error.message); // important
    res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router;
