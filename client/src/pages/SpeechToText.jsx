import React, { useState } from "react";
import './SpeechToText.css';

function SpeechToText() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile.type.startsWith('audio/')) {
      setError('Please upload a valid audio file');
      return;
    }
    setFile(selectedFile);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select an audio file first!");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      setError('');
      const res = await fetch("http://127.0.0.1:5050/api/stt", {
        
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Something went wrong');

      setResult(data.text);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="speech-to-text-container">
      <h2>Speech to Text</h2>

      <div className="file-input-container">
        <input 
          type="file" 
          id="audio-upload"
          accept="audio/*"
          onChange={handleFileChange}
        />
        <label htmlFor="audio-upload" className="file-upload-label">
          {file ? file.name : "Choose Audio File"}
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button onClick={handleUpload} disabled={loading || !file}>
        {loading ? "Converting..." : "Convert to Text"}
      </button>

      {result && (
        <div className="result-container">
          <h3>Result:</h3>
          <p>{result}</p>
          <button onClick={() => navigator.clipboard.writeText(result)}>Copy</button>
        </div>
      )}
    </div>
  );
}

export default SpeechToText;