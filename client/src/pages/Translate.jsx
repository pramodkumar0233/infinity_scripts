import { useState } from "react";
import axios from "axios";
import languages from "../utils/languageOptions";

import './Translate.css';

export default function Translate() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("hi");
  const [result, setResult] = useState("");

  const handleTranslate = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/translate", {
        text,
        targetLang: language,
      });
      setResult(res.data.translatedText);
    } catch (err) {
      setResult("Translation failed.");
    }
  };

  return (
    <div className="translate-page">
      <h2>Language Translation</h2>
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
  {languages.map((lang) => (
    <option key={lang.code} value={lang.code}>
      {lang.name}
    </option>
  ))}
</select>


      <div className="translate-box">
        <textarea
          placeholder="Enter text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <textarea
          placeholder="Translation appears here..."
          value={result}
          readOnly
        />
      </div>

      <button onClick={handleTranslate}>Translate</button>
    </div>
  );
}
