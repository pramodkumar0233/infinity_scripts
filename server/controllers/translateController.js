const translate = require("google-translate-api-x");

// Controller to handle translation
exports.translateText = async (req, res) => {
  const { text, targetLang } = req.body;

  if (!text || !targetLang) {
    return res.status(400).json({ error: "Text and target language are required" });
  }

  try {
    const result = await translate(text, { to: targetLang });
    res.json({ translatedText: result.text });
  } catch (error) {
    console.error("Translation Error:", error.message);
    res.status(500).json({ error: "Translation failed" });
  }
};
