import { useState } from "react";
import axios from "axios";
import './TextFromImage.css';

export default function TextFromImage() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleExtractText = async () => {
    if (!image) return;
  
    const formData = new FormData();
    formData.append("image", image);
  
    try {
      const res = await axios.post("http://localhost:5000/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      setText(res.data.extractedText); // ✅ match with backend
    } catch (err) {
      console.error("OCR error:", err);
      setText("Text extraction failed.");
    }
  };
  
  return (
    <div className="ocr-page">
      <h2>Text from Image</h2>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleExtractText}>Extract Text</button>

      <textarea
        placeholder="Extracted text will appear here..."
        value={text}
        readOnly
      />
    </div>
  );
}
