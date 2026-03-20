import { useEffect, useState } from "react";
import {
  getRulesAPI,
  searchRulesAPI,
  addRuleAPI,
  toggleRuleAPI,
  deleteRuleAPI,
  updateRuleAPI // New API
} from "../services/api";

export default function Rules() {
  const [rules, setRules] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  // Form for adding new rules
  const [form, setForm] = useState({
    rule_name: "",
    regex_pattern: "",
    severity: "",
    category: ""
  });

  // State for the Edit Modal
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    loadRules();
  }, []);

  /* ---------------- LOAD RULES ---------------- */
  const loadRules = async () => {
    try {
      setLoading(true);
      const res = await getRulesAPI();
      setRules(res.data);
    } catch (err) {
      console.error("LOAD RULES ERROR", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SEARCH RULES ---------------- */
  const searchRules = async () => {
    try {
      if (!search) {
        loadRules();
        return;
      }
      const res = await searchRulesAPI(search);
      setRules(res.data);
    } catch (err) {
      console.error("SEARCH ERROR", err);
    }
  };

  /* ---------------- ADD RULE ---------------- */
  const addRule = async () => {
    try {
      if (!form.rule_name || !form.regex_pattern) {
        alert("Rule name and regex required");
        return;
      }
      await addRuleAPI({
        rule_name: form.rule_name,
        description: "",
        regex_pattern: form.regex_pattern,
        severity: form.severity || "MEDIUM",
        category: form.category || "General"
      });
      setForm({ rule_name: "", regex_pattern: "", severity: "", category: "" });
      loadRules();
    } catch (err) {
      console.error("ADD RULE ERROR", err);
    }
  };

  /* ---------------- UPDATE RULE (SAVE EDIT) ---------------- */
  const saveEdit = async () => {
    try {
      if (!selectedRule.rule_name || !selectedRule.regex_pattern) {
        alert("Rule name and regex required");
        return;
      }
      await updateRuleAPI(selectedRule.id, selectedRule);
      setSelectedRule(null); // Close modal
      loadRules();
    } catch (err) {
      console.error("UPDATE ERROR", err);
      alert("Failed to update rule");
    }
  };

  /* ---------------- TOGGLE RULE ---------------- */
  const toggleRule = async (id) => {
    try {
      await toggleRuleAPI(id);
      loadRules();
    } catch (err) {
      console.error("TOGGLE ERROR", err);
    }
  };

  /* ---------------- DELETE RULE ---------------- */
  const deleteRule = async (id) => {
    try {
      // if (!window.confirm("Disable this rule?")) return;
      await deleteRuleAPI(id);
      loadRules();
    } catch (err) {
      console.error("DELETE ERROR", err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Rules Management</h1>

      {/* SEARCH BAR */}
      <div className="flex gap-3 mb-6">
        <input
          className="border p-2 rounded w-80"
          placeholder="Search rule..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={searchRules} className="bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
        <button onClick={loadRules} className="bg-gray-500 text-white px-4 py-2 rounded">
          Reset
        </button>
      </div>

      {/* ADD RULE FORM */}
      <div className="bg-gray-100 p-4 rounded mb-8">
        <h2 className="font-semibold mb-4">Add New Rule</h2>
        <div className="grid grid-cols-4 gap-4">
          <input
            className="border p-2 rounded"
            placeholder="Rule Name"
            value={form.rule_name}
            onChange={(e) => setForm({ ...form, rule_name: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Regex Pattern"
            value={form.regex_pattern}
            onChange={(e) => setForm({ ...form, regex_pattern: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Severity (HIGH/MEDIUM/LOW)"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          />
          <input
            className="border p-2 rounded"
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <button onClick={addRule} className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
          Add Rule
        </button>
      </div>

      {/* RULES TABLE */}
      <div className="overflow-x-auto shadow rounded-lg">
        <table className="w-full border rounded bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Rule</th>
              <th className="p-3 text-left">Severity</th>
              <th className="p-3 text-left">Enabled</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan="5" className="p-4 text-center">Loading...</td></tr>
            )}
            {!loading && rules.length === 0 && (
              <tr><td colSpan="5" className="p-4 text-center">No rules found</td></tr>
            )}
            {!loading && rules.map((rule) => (
              <tr key={rule.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{rule.id}</td>
                <td className="p-3 font-medium">{rule.rule_name}</td>
                <td className="p-3">{rule.severity}</td>
                <td className="p-3">{rule.enabled ? "Yes" : "No"}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => toggleRule(rule.id)} className="bg-yellow-500 px-3 py-1 rounded text-white text-sm">
                    Toggle
                  </button>
                  <button onClick={() => setSelectedRule(rule)} className="bg-blue-600 px-3 py-1 rounded text-white text-sm">
                    Edit
                  </button>
                  {/* <button onClick={() => deleteRule(rule.id)} className="bg-red-500 px-3 py-1 rounded text-white text-sm">
                    Disable
                  </button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL POP-UP */}
      {selectedRule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">Edit Rule</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Rule Name</label>
                <input
                  className="border p-2 rounded w-full bg-gray-50"
                  value={selectedRule.rule_name}
                  onChange={(e) => setSelectedRule({ ...selectedRule, rule_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Regex Pattern</label>
                <textarea
                  className="border p-2 rounded w-full bg-gray-50 font-mono text-xs"
                  rows="3"
                  value={selectedRule.regex_pattern}
                  onChange={(e) => setSelectedRule({ ...selectedRule, regex_pattern: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Severity</label>
                  <select 
                    className="border p-2 rounded w-full bg-gray-50"
                    value={selectedRule.severity}
                    onChange={(e) => setSelectedRule({ ...selectedRule, severity: e.target.value })}
                  >
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="LOW">LOW</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    className="border p-2 rounded w-full bg-gray-50"
                    value={selectedRule.category || ""}
                    onChange={(e) => setSelectedRule({ ...selectedRule, category: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button 
                onClick={() => setSelectedRule(null)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
              >
                Cancel
              </button>
              <button 
                onClick={saveEdit} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}