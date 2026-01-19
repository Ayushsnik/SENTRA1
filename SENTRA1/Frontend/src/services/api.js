import axios from "axios";

// 🔗 Backend base URL
const API_URL = "http://localhost:5000/api";

// 🌐 Axios instance
const api = axios.create({
  baseURL: API_URL,
});

// 🔐 Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   AUTH API
========================= */
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

/* =========================
   INCIDENTS (STUDENT)
========================= */
export const incidentsAPI = {
  // 🔥 IMPORTANT: multipart/form-data REQUIRED
  create: (formData) =>
    api.post("/incidents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  myReports: () => api.get("/incidents/my-reports"),

  getById: (id) => api.get(`/incidents/${id}`),

  trackByReference: (refId) =>
    api.get(`/incidents/reference/${refId}`),
};

/* =========================
   ADMIN API
========================= */
export const adminAPI = {
  // ⭐ UPDATED: Use /admin/incidents (not /admin/reports)
  getAllIncidents: (filters) => api.get("/admin/incidents", { params: filters }),

  // ⭐ UPDATED: Use PATCH (not PUT)
  updateIncident: (id, data) => api.patch(`/admin/incidents/${id}`, data),

  // Legacy endpoints (keep for backwards compatibility)
  getAllReports: () => api.get("/admin/reports"),
  updateStatus: (id, status) => api.put(`/admin/reports/${id}/status`, { status }),

  // Analytics
  analytics: () => api.get("/admin/analytics"),
};

/* =========================
   AWARENESS API
========================= */
export const awarenessAPI = {
  getAll: () => api.get("/awareness"),
  create: (data) => api.post("/awareness", data),
  update: (id, data) => api.put(`/awareness/${id}`, data),
  remove: (id) => api.delete(`/awareness/${id}`),
};

export default api;
