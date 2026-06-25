import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const api = axios.create({ baseURL: API });

export const getDashboard = () => api.get("/dashboard/stats").then((r) => r.data);
export const getOpportunities = () => api.get("/opportunities").then((r) => r.data);
export const calcLandedCost = (payload) => api.post("/calculator/landed-cost", payload).then((r) => r.data);
export const calcImportVsLocal = (payload) => api.post("/calculator/import-vs-local", payload).then((r) => r.data);
export const calcProfitMode = (payload) => api.post("/calculator/profit-mode", payload).then((r) => r.data);
export const getChatHistory = (sessionId) => api.get(`/assistant/history/${sessionId}`).then((r) => r.data);

export const fmtAUD = (n) =>
  new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", maximumFractionDigits: 0 }).format(n || 0);

export const fmtNum = (n) => new Intl.NumberFormat("en-AU").format(n || 0);
