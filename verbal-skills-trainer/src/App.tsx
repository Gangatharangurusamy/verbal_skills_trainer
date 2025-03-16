import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import VoiceAnalysis from "./pages/VoiceAnalysis"; 
import TrainingApp from "./pages/SkillTraining";
import PresentationAssessment from "./pages/PresentationAssessment";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/voice" element={<VoiceAnalysis />} /> {/* New Voice Interface Route */}
        <Route path="/skill" element={<TrainingApp />} />
        <Route path="/presentation" element={<PresentationAssessment />} />
      </Routes>
    </Router>
  );
}

export default App;
