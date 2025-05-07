import { useNavigate } from "react-router-dom";
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <h2>Welcome to Infiniti Scripts!</h2>
      
      <div className="card-container">

        <div className="card" onClick={() => navigate("/translate")}>
          <img src="/images/translate.jpg" alt="Translate" />
          <h3>Language Translate</h3>
        </div>

        <div className="card" onClick={() => navigate("/text-from-image")}>
          <img src="/images/text-from-image.jpg" alt="OCR" />
          <h3>Text from Image</h3>
        </div>

        <div className="card" onClick={() => navigate("/text-to-speech")}>
          <img src="/images/tts.jpg" alt="Text to Speech" />
          <h3>Text to Speech</h3>
        </div>

        <div className="card" onClick={() => navigate("/speech-to-text")}>
          <img src="/images/tts.jpg" alt="Speech to text" />
          <h3>Speech to Text</h3>
        </div>

        <div className="card" onClick={() => navigate("/summarize")}>
          <img src="/images/tts.jpg" alt="summarize" />
          <h3>Summarize</h3>
        </div>

        <div className="card" onClick={() => navigate("/future funtions")}>
          <img src="/images/translate.jpg" alt="IDK" />
          <h3>IDK</h3>
        </div>

      </div>
    </div>
  );
}
