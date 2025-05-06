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

      </div>
    </div>
  );
}
