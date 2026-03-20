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
  const [activeScanType, setActiveScanType] = useState(null); // 'text' or 'file'

  useEffect(() => {
    const fetchRules = async () => {
      try {
        const res = await getRulesAPI();
        const activeRules = res.data.filter(r => r.enabled);
        setAvailableRules(activeRules);
        // Default select all rules for convenience
        setSelectedRuleIds(activeRules.map(r => r.id));
      } catch (err) {
        console.error("Failed to load rules", err);
      }
    };
    fetchRules();
  }, []);

  // Triggered when user clicks "Scan" button on the main UI
  const handleInitiateScan = (type) => {
    if (type === 'text' && !text.trim()) return alert("Please enter text first");
    if (type === 'file' && !file) return alert("Please upload a file first");
    
    setActiveScanType(type);
    setShowSidebar(true);
  };

  const executeScan = async () => {
    if (selectedRuleIds.length === 0) return alert("Select at least one rule");
    
    setShowSidebar(false);
    setLoading(true);
    setResult(null);

    try {
      let res;
      if (activeScanType === 'text') {
        res = await scanTextAPI(text, selectedRuleIds);
      } else {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("ruleIds", JSON.stringify(selectedRuleIds));
        res = await scanFileAPI(formData);
      }
      setResult(res.data);
    } catch (err) {
      alert("Scan failed. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans transition-all duration-300">
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">GDPR Guardian</h1>
          <p className="text-slate-500 mt-2 text-lg">AI-Powered PII Detection & Redaction</p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* TEXT CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg text-blue-600">✍️</div>
              <h2 className="text-xl font-bold text-slate-700">Scan Raw Text</h2>
            </div>
            <textarea
              className="flex-grow w-full border-none bg-slate-50 rounded-xl p-4 focus:ring-2 focus:ring-blue-400 outline-none min-h-[200px] text-slate-600 italic"
              placeholder="Paste content to redact..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              onClick={() => handleInitiateScan('text')}
              className="mt-6 bg-slate-800 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1"
            >
              Analyze Text →
            </button>
          </div>

          {/* FILE CARD */}
          <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col">
            <div className="mb-4 flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">📁</div>
              <h2 className="text-xl font-bold text-slate-700">Upload Document</h2>
            </div>
            <div className={`flex-grow border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all ${file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'}`}>
              <input 
                type="file" id="fileIn" className="hidden" 
                onChange={(e) => setFile(e.target.files[0])} 
              />
              <label htmlFor="fileIn" className="cursor-pointer text-center p-6">
                <span className="text-5xl mb-4 block">{file ? '✅' : '📤'}</span>
                <p className="font-semibold text-slate-600">{file ? file.name : 'Drop file or click to browse'}</p>
                <p className="text-xs text-slate-400 mt-2">Supports PDF, TXT, CSV (Max 10MB)</p>
              </label>
            </div>
            <button
              onClick={() => handleInitiateScan('file')}
              className="mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg hover:-translate-y-1"
            >
              Process File →
            </button>
          </div>
        </div>

        {/* LOADING & RESULTS */}
        {loading && (
          <div className="mt-12 flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Scanning content against selected policies...</p>
          </div>
        )}

        {result && !loading && (
          <div className="mt-12 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            <div className="bg-slate-800 p-6 flex justify-between items-center text-white">
              <h3 className="text-lg font-bold uppercase tracking-widest">Inspection Report</h3>
              <span className="bg-red-500 px-3 py-1 rounded-full text-xs font-bold">
                {result.violations.length} Violations Found
              </span>
            </div>
            <div className="p-8 grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Redacted Output</h4>
                <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl font-mono text-sm leading-relaxed shadow-inner overflow-x-auto">
                  {result.redactedText}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase mb-4 tracking-widest">Breach Details</h4>
                <div className="space-y-3">
                  {result.violations.length > 0 ? result.violations.map((v, i) => (
                    <div key={i} className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                      <p className="text-xs font-bold text-red-700 uppercase">{v.type}</p>
                      <p className="text-sm text-slate-700 mt-1 truncate">{v.value}</p>
                    </div>
                  )) : (
                    <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r-xl text-emerald-700 font-bold text-sm">
                      Clean Record: No PII detected.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR (RULE SELECTION) */}
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-500 ease-in-out z-50 border-l ${showSidebar ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black text-slate-800">Scan Policy</h2>
            <button onClick={() => setShowSidebar(false)} className="text-slate-400 hover:text-red-500 text-2xl">✕</button>
          </div>
          
          <p className="text-sm text-slate-500 mb-6 font-medium italic">
            Select the GDPR identifiers you want to search for in this session:
          </p>

          <div className="flex-grow overflow-y-auto space-y-3 pr-2 custom-scrollbar">
            {availableRules.map(rule => (
              <div 
                key={rule.id}
                onClick={() => {
                  setSelectedRuleIds(prev => 
                    prev.includes(rule.id) ? prev.filter(id => id !== rule.id) : [...prev, rule.id]
                  )
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedRuleIds.includes(rule.id) ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm ${selectedRuleIds.includes(rule.id) ? 'text-blue-700' : 'text-slate-600'}`}>
                    {rule.rule_name}
                  </span>
                  {selectedRuleIds.includes(rule.id) && <span className="text-blue-600">✔</span>}
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded uppercase font-bold text-slate-500">
                    {rule.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-3">
             <button 
              onClick={executeScan}
              className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all"
            >
              Confirm & Start Scan
            </button>
            <button 
              onClick={() => setShowSidebar(false)}
              className="w-full text-slate-400 font-bold py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* OVERLAY */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}