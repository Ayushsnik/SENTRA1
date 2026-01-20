import axios from "axios";

// 🔗 Backend base URL (Render)
const API_BASE_URL = "https://sentra1.onrender.com/api";

// 🌐 Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // ✅ important for CORS + future cookie auth
});

// 🔐 Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // ensure headers object exists
      config.headers = config.headers || {};
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
  getMe: () => api.get("/auth/me"),
};

/* =========================
   INCIDENTS (USER)
========================= */
export const incidentsAPI = {
  // Create incident (multipart)
  create: (formData) =>
    api.post("/incidents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  getMyReports: () => api.get("/incidents/my"),
  getById: (id) => api.get(`/incidents/${id}`),
  trackByReference: (refId) =>
    api.get(`/incidents/reference/${refId}`),
};

/* =========================
   ADMIN API
========================= */
export const adminAPI = {
  getAllIncidents: (filters) =>
    api.get("/admin/incidents", { params: filters }),

  updateIncident: (id, data) =>
    api.patch(`/admin/incidents/${id}`, data),

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
