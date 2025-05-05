import React, { useState } from "react";
import axios from "axios";
import "./OCRPage.css";

const OCRPage = () => {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [error, setError] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
    setError("");
  };

  const handleOCR = async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await axios.post("http://localhost:5000/api/ocr", formData);
      setOcrText(res.data.text || "");
      setError("");
    } catch (err) {
      console.error("OCR failed:", err);
      setError("OCR failed. Try a clearer image or check backend service.");
    }
  };

  const copyText = () => {
    navigator.clipboard.writeText(ocrText);
  };

  const cutText = () => {
    navigator.clipboard.writeText(ocrText);
    setOcrText("");
  };

  return (
    <div className="ocr-container">
      <div className="upload-section">
        <input type="file" onChange={handleImageChange} />
        <button onClick={handleOCR}>Convert</button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="textarea-wrapper">
        <div className="icon-bar">
          <span onClick={copyText} title="Copy">📋</span>
          <span onClick={cutText} title="Cut">✂️</span>
        </div>
        <textarea
          className="ocr-textarea"
          placeholder="OCR result will appear here..."
          value={ocrText}
          onChange={(e) => setOcrText(e.target.value)}
        />
      </div>
    </div>
  );
};

export default OCRPage;
