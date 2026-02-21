import { useEffect, useState } from "react";
import { fetchScanHistoryAPI } from "../services/api";



export default function Dashboard() {
  const [scans, setScans] = useState([]);

  useEffect(() => {
    fetchScanHistoryAPI().then((res) =>
      setScans(res.data)
    );
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Scan History
      </h1>

      <div className="overflow-x-auto">
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Violations</th>
              <th className="p-3 text-left">Date</th>
              {/* <th className="p-3 text-left">Redacted Content</th> */}

            </tr>
          </thead>
          <tbody>
            {scans.map((scan) => (
              <tr
                key={scan.id}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">{scan.id}</td>
                <td className="p-3">{scan.scan_type}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      scan.violation_count > 0
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {scan.violation_count}
                  </span>
                </td>
                <td className="p-3">
                  {new Date(scan.created_at).toLocaleString()}
                </td>
                {/* <td className="p-3">{scan.redacted_content}</td> */}

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
