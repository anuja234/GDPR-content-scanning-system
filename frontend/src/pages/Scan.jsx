import { useEffect, useState } from "react";
import {
  scanTextAPI,
  scanFileAPI,
  getRulesAPI,
} from "../services/api";

export default function Scan() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Rules & UI State
  const [availableRules, setAvailableRules] = useState([]);
  const [selectedRuleIds, setSelectedRuleIds] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await getRulesAPI();
        const activeRules = res.data.filter(r => r.enabled);
        setAvailableRules(activeRules);
        setSelectedRuleIds(activeRules.map(r => r.id));
      } catch (err) {
        console.error("Failed to load rules", err);
      }
    };
    fetchRules();
  }, []);

  // 🔥 SINGLE BUTTON HANDLER
  const handleInitiateScan = () => {
    if (!text.trim() && !file) {
      return alert("Please enter text or upload a file");
    }
    setShowSidebar(true);
  };

  const executeScan = async () => {
    if (selectedRuleIds.length === 0) {
      return alert("Select at least one rule");
    }

    setShowSidebar(false);
    setLoading(true);
    setResult(null);

    try {
      let res;

      // ✅ Decide automatically
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("ruleIds", JSON.stringify(selectedRuleIds));
        res = await scanFileAPI(formData);
      } else {
        res = await scanTextAPI(text, selectedRuleIds);
      }

      setResult(res.data);
    } catch (err) {
      alert("Scan failed. Check backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">

        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-800">
            GDPR Guardian
          </h1>
          <p className="text-slate-500 mt-2 text-lg">
            AI-Powered PII Detection & Redaction
          </p>
        </header>

        {/* 🔥 MERGED SINGLE CARD */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">

          <h2 className="text-xl font-bold text-slate-700 mb-4">
            Scan Text or Upload File
          </h2>

          {/* TEXT */}
          <textarea
            className="w-full bg-slate-50 rounded-xl p-4 mb-6 outline-none min-h-[150px]"
            placeholder="Paste text here (optional)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* FILE */}
          <div className={`border-2 border-dashed rounded-xl p-6 text-center mb-6 ${
            file ? "border-emerald-400 bg-emerald-50" : "border-slate-200"
          }`}>
            <input
              type="file"
              id="fileInput"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />

            <label htmlFor="fileInput" className="cursor-pointer">
              <p className="text-lg">
                {file ? "✅ " + file.name : "📤 Click to upload file"}
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Supports PDF, TXT, CSV
              </p>
            </label>
          </div>

          {/* ✅ SINGLE BUTTON */}
          <button
            onClick={handleInitiateScan}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg"
          >
            Scan Data →
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="mt-10 text-center">
            <p>Scanning...</p>
          </div>
        )}

        {/* RESULT */}
        {result && !loading && (
          <div className="mt-10 bg-white p-6 rounded-xl shadow">
            <h3 className="font-bold mb-4">
              {result.violations.length} Violations Found
            </h3>

            <pre className="bg-slate-900 text-white p-4 rounded">
              {result.redactedText}
            </pre>
          </div>
        )}
      </div>

      {/* SIDEBAR */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl p-6 transition ${
        showSidebar ? "translate-x-0" : "translate-x-full"
      }`}>
        <h2 className="text-xl font-bold mb-4">Select Rules</h2>

        {availableRules.map(rule => (
          <div
            key={rule.id}
            onClick={() => {
              setSelectedRuleIds(prev =>
                prev.includes(rule.id)
                  ? prev.filter(id => id !== rule.id)
                  : [...prev, rule.id]
              );
            }}
            className={`p-3 mb-2 border rounded cursor-pointer ${
              selectedRuleIds.includes(rule.id)
                ? "bg-blue-100 border-blue-500"
                : ""
            }`}
          >
            {rule.rule_name}
          </div>
        ))}

        <button
          onClick={executeScan}
          className="w-full bg-blue-600 text-white py-3 mt-4 rounded"
        >
          Confirm & Scan
        </button>
      </div>
    </div>
  );
}