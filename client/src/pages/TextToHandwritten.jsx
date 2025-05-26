import { useState } from "react";
import axios from "axios";
import './TextToHandwritten.css';

export default function TextToHandwritten() {
  const [text, setText] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);
    setError("");
    setImageBase64("");

    try {
      const res = await axios.post("http://localhost:5050/api/handwritten", { text });

      if (res.data.image_base64) {
        setImageBase64(res.data.image_base64);
      } else if (res.data.error) {
        setError(res.data.error);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      setError("Failed to generate handwritten image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageBase64) return;

    const a = document.createElement("a");
    a.href = `data:image/png;base64,${imageBase64}`;
    a.download = "handwritten.png";
    a.click();
  };

  return (
    <div className="handwritten-page">
      <h2>Text to Handwritten Image</h2>

      <textarea
        rows={5}
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p className="error">{error}</p>}

      {imageBase64 && (
        <div className="result-container">
          <div className="download-icon" onClick={handleDownload} title="Download Image">
            ⬇️
          </div>

          <div className="scroll-image">
            <img
              src={`data:image/png;base64,${imageBase64}`}
              alt="Handwritten text"
            />
          </div>
        </div>
      )}
    </div>
  );
}
