import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
const API = `${BASE}/api`;

const client = axios.create({ baseURL: API });

export const api = {
  getMatter: () => client.get("/matter").then((r) => r.data),
  getPortfolio: () => client.get("/portfolio").then((r) => r.data),
  uploadSource: (file) => {
    const fd = new FormData();
    if (file) fd.append("file", file);
    else fd.append("filename", "Successor Acceptance & Resignation Instrument.pdf");
    return client.post("/upload-source", fd).then((r) => r.data);
  },
  verifyClaims: () => client.post("/verify-claims").then((r) => r.data),
  createChangeset: () => client.post("/create-changeset").then((r) => r.data),
  approveChangeset: () => client.post("/approve-changeset").then((r) => r.data),
  obligationAction: (id, body) => client.post(`/obligations/${id}/action`, body).then((r) => r.data),
  elicitedContext: (body) => client.post("/elicited-context", body).then((r) => r.data),
  askMargaret: (body) => client.post("/margaret", body).then((r) => r.data),
  reset: () => client.post("/reset").then((r) => r.data),
};

export default api;
