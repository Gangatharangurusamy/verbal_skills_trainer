import { Link } from "react-router-dom";

export function Sidebar() {
  return (
    <nav className="w-1/4 bg-gray-800 text-white p-4">
      <h2 className="text-lg font-bold mb-4">Navigation</h2>
      <ul>
        <li><Link to="/chat">Chat</Link></li>
        <li><Link to="/voice">Voice Analysis</Link></li>
        <li><Link to="/skills">Skill Training</Link></li>
        <li><Link to="/presentation">Presentation</Link></li>
      </ul>
    </nav>
  );
}
