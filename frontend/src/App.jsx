import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-900 text-white px-6 py-4 flex gap-6">
        <Link to="/" className="hover:underline">
          Scan
        </Link>
        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>
      </nav>

      <Routes>
        <Route path="/" element={<Scan />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
