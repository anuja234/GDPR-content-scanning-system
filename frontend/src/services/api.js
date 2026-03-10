import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000",
});

export const scanTextAPI = (text) =>
  API.post("/scan-text", { text });

export const scanFileAPI = (formData) =>
  API.post("/scan-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const fetchScanHistoryAPI = () =>
  API.get("/api/scans");
