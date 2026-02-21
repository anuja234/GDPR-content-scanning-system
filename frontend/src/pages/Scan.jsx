import { useState } from "react";
import {
  scanTextAPI,
  scanFileAPI,
} from "../services/api";

export default function Scan() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const scanText = async () => {
    if (!text.trim()) return;
    try {
      setLoading(true);
      const res = await scanTextAPI(text);
      setResult(res.data);
    } catch {
      alert("Text scan failed");
    } finally {
      setLoading(false);
    }
  };

  const scanFile = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await scanFileAPI(formData);
      setResult(res.data);
    } catch {
      alert("File scan failed");
    } finally {
      setLoading(false); 
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        GDPR Content Scanning & Redaction
      </h1>

      <div className="mb-8">
        <h2 className="font-semibold mb-2">Scan Text</h2>
        <textarea
          className="w-full border rounded p-3"
          rows="4"
          placeholder="Enter text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={scanText}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Scan Text
        </button>
      </div>


      <div className="mb-8">
        <h2 className="font-semibold mb-2">
          Scan File (PDF / TXT)
        </h2>
        <input
          type="file"
          accept=".pdf,.csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button
          onClick={scanFile}
          className="ml-3 bg-green-600 text-white px-4 py-2 rounded"
        >
          Scan File
        </button>
      </div>

      {loading && <p>Scanning...</p>}

      {result && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">
            Redacted Output
          </h2>
          <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap">
            {result.redactedText}
          </pre>

          <h2 className="font-semibold mt-4">
            Detected Violations
          </h2>
          {result.violations.length === 0 ? (
            <p>No sensitive data found</p>
          ) : (
            <ul className="list-disc ml-5">
              {result.violations.map((v, i) => (
                <li key={i}>
                  {v.type} → {v.value}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
