import { useState } from "react";
import axios from "axios";
import './TextToSpeech.css';

export default function TextToSpeech() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/tts", { text });
      console.log("Received audio path from backend:", res.data.audioPath);

      // Add timestamp to prevent caching
      const url = `http://localhost:5000${res.data.audioPath}?t=${Date.now()}`;
      console.log("Full audio URL:", url);

      setAudioUrl(url);
    } catch (err) {
      console.error("Error:", err);
      alert("Text-to-speech conversion failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tts-page">
      <h2>Text to Speech</h2>

      <textarea
        placeholder="Enter text to convert"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleConvert} disabled={loading}>
        {loading ? "Converting..." : "Convert to Speech"}
      </button>

      {audioUrl && (
        <div>
          <h4>Playback:</h4>
          <audio controls key={audioUrl}>
            <source src={audioUrl} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
}
