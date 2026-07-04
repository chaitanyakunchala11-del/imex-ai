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

// --- Phase 1: client id, projects & saved calculations ---
export function getClientId() {
  let c = localStorage.getItem("imex_client");
  if (!c) {
    c = (crypto.randomUUID && crypto.randomUUID()) || String(Date.now() + Math.random());
    localStorage.setItem("imex_client", c);
  }
  return c;
}

export const createProject = (payload) => api.post("/projects", payload).then((r) => r.data);
export const listProjects = (clientId) =>
  api.get("/projects", { params: { client_id: clientId } }).then((r) => r.data);
export const updateProject = (id, payload) => api.patch(`/projects/${id}`, payload).then((r) => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then((r) => r.data);

export const saveCalculation = (payload) => api.post("/calculations", payload).then((r) => r.data);
export const listCalculations = (clientId, params = {}) =>
  api.get("/calculations", { params: { client_id: clientId, ...params } }).then((r) => r.data);
export const deleteCalculation = (id) => api.delete(`/calculations/${id}`).then((r) => r.data);
