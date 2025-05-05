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

        <div className="card" onClick={() => navigate("/ocr")}>
          <img src="/images/Handwritten.jpg" alt="Handwritten to Text" />
          <h3>Handwritten to Text</h3>
        </div>


        <div className="card" onClick={() => navigate("/text-to-speech")}>
          <img src="/images/Handwritten.jpg" alt="Text to Speech" />
          <h3>Text to Speech</h3>
        </div>

        {/* Future Services */}
        <div className="card coming-soon">
          <img src="/images/text-to-speech.png" alt="Coming Soon" />
          <h3>Text to Speech (Coming Soon)</h3>
        </div>

      </div>
    </div>
  );
}
