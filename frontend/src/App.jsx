import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Scan from "./pages/Scan";
import Dashboard from "./pages/Dashboard";

export default function App() {

  return (

  <BrowserRouter>

    <nav className="bg-gray-900 text-white px-6 py-4 flex justify-between">

      <div className="flex gap-6">

        <Link to="/scan" className="hover:underline">
          Scan
        </Link>

        <Link to="/dashboard" className="hover:underline">
          Dashboard
        </Link>

      </div>

    </nav>


    <Routes>

      <Route path="/scan" element={<Scan />} />

      <Route path="/dashboard" element={<Dashboard />} />

    </Routes>

  </BrowserRouter>

  );

}