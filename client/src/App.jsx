import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Translate from "./pages/Translate"
import TextFromImage from "./pages/TextFromImage";
import TextToSpeech from "./pages/TextToSpeech";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/text-from-image" element={<TextFromImage />} />
        <Route path="/text-to-speech" element={<TextToSpeech />} />
        </Routes>
    </Router>
  );
}

export default App;
