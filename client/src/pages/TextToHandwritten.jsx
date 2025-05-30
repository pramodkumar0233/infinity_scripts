import { useState, useEffect } from "react";
import axios from "axios";
import './TextToHandwritten.css';

export default function TextToHandwritten() {
  const [text, setText] = useState("");
  const [imageList, setImageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [font, setFont] = useState("");
  const [fontSize, setFontSize] = useState("16");
  const [color, setColor] = useState("#1B1464");
  const [paperType, setPaperType] = useState("");

  const [fontOptions, setFontOptions] = useState([]);
  const [paperOptions, setPaperOptions] = useState([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/options");
        setFontOptions(res.data.fonts);
        setPaperOptions(res.data.papers);
        setFont(res.data.fonts[0] || "");
        setPaperType(res.data.papers[0] || "");
      } catch (err) {
        console.error("Failed to load options:", err);
      }
    };
    fetchOptions();
  }, []);

  const handleGenerate = async () => {
    if (!text.trim()) {
      alert("Please enter some text.");
      return;
    }

    setLoading(true);
    setError("");
    setImageList([]);

    try {
      const res = await axios.post("http://localhost:5050/api/handwritten", {
        text, font, fontSize, color, paper: paperType,
      });

      if (res.data.images) {
        setImageList(res.data.images);
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
    if (imageList.length === 0) return;
    imageList.forEach((base64, index) => {
      const a = document.createElement("a");
      a.href = `data:image/png;base64,${base64}`;
      a.download = `handwritten_page${index + 1}.png`;
      a.click();
    });
  };

  return (
    <div className="handwritten-page">
      <h2>Text to Handwritten Image</h2>

      <label>Text</label>
      <textarea
        rows={6}
        placeholder="Enter your text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <div className="controls">
        <div>
          <label>Font Family</label>
          <select value={font} onChange={(e) => setFont(e.target.value)}>
            {fontOptions.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Font Size</label>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)}>
            <option value="14">14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
            <option value="20">20px</option>
          </select>
        </div>

        <div>
          <label>Ink Color</label>
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>

        <div>
          <label>Paper Type</label>
          <select value={paperType} onChange={(e) => setPaperType(e.target.value)}>
            {paperOptions.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {error && <p className="error">{error}</p>}

      {imageList.length > 0 && (
        <div className="result-container">
          <div className="download-icon" onClick={handleDownload} title="Download All Pages">⬇️</div>
          <div className="scroll-image">
            {imageList.map((img, index) => (
              <img
                key={index}
                src={`data:image/png;base64,${img}`}
                alt={`Handwritten Page ${index + 1}`}
                className="output-paper"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
