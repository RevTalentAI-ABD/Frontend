import * as api from "../api/api";

export const aiAPI = {
  ask: (question) =>
    api.post("/api/ai/ask", { question }),

  resume: (resume, job) =>
    api.post("/api/ai/resume", { resume, job }),

  performance: (history) =>
    api.post("/api/ai/performance", { history }),
};
