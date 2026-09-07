import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
const client = axios.create({ baseURL: `${BASE}/api` });
const q = (mid) => ({ params: { matter_id: mid } });

export const api = {
  listMatters: () => client.get("/matters").then((r) => r.data),
  getMatter: (mid) => client.get("/matter", q(mid)).then((r) => r.data),
  getPortfolio: () => client.get("/portfolio").then((r) => r.data),
  uploadSource: (mid, file, fallbackName) => {
    const fd = new FormData();
    if (file) fd.append("file", file);
    else if (fallbackName) fd.append("filename", fallbackName);
    return client.post("/upload-source", fd, q(mid)).then((r) => r.data);
  },
  verifyClaims: (mid) => client.post("/verify-claims", {}, q(mid)).then((r) => r.data),
  createChangeset: (mid) => client.post("/create-changeset", {}, q(mid)).then((r) => r.data),
  approveChangeset: (mid) => client.post("/approve-changeset", {}, q(mid)).then((r) => r.data),
  obligationAction: (mid, id, body) => client.post(`/obligations/${id}/action`, body, q(mid)).then((r) => r.data),
  sendCommunication: (mid, body) => client.post("/communications/send", body, q(mid)).then((r) => r.data),
  elicitedContext: (mid, body) => client.post("/elicited-context", body, q(mid)).then((r) => r.data),
  askMargaret: (body) => client.post("/margaret", body).then((r) => r.data),
  reset: () => client.post("/reset").then((r) => r.data),
};

export default api;
