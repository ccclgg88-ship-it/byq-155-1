import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Menu from "@/pages/Menu";
import Game from "@/pages/Game";
import Result from "@/pages/Result";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/game" element={<Game />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </Router>
  );
}
