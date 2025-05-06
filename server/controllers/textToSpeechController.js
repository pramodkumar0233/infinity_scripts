const gTTS = require('gtts');
const path = require('path');
const fs = require('fs');

exports.convertTextToSpeech = (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Text is required" });
  }

  // Ensure audio directory exists
  const audioDir = path.join(__dirname, '..', 'tts-audio');
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir);
  }

  // Always use the same filename
  const filePath = path.join(audioDir, 'output.mp3');

  const gtts = new gTTS(text, 'en');

  gtts.save(filePath, (err) => {
    if (err) {
      console.error("Error saving audio file:", err);
      return res.status(500).json({ error: "Failed to generate audio" });
    }

    console.log("Saved audio file at:", filePath);
    res.json({ audioPath: `/audio/output.mp3` }); // Always return same path
  });
};
