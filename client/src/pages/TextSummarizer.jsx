import { useState } from "react";
import axios from "axios";
import "./TextSummarizer.css";

export default function TextSummarizer() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    try {
      const res = await axios.post("http://localhost:5050/api/summarize", {
        text: inputText
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error("Summarization failed:", err);
      setSummary("Error summarizing text.");
    }
  };

  return (
    <div className="summarizer-container">
      <h2>Text Summarizer</h2>
      <textarea
        placeholder="Enter text to summarize..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={10}
      />
      <button onClick={handleSummarize}>Summarize</button>
      <div className="summary-result">
        <h3>Summary:</h3>
        <p>{summary}</p>
      </div>
    </div>
  );
}
