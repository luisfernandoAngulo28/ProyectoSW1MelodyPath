import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = Cookies.get("refresh_token");
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh });
          Cookies.set("access_token", data.access, { expires: 1 });
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/auth/login/", { email, password }),
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register/", data),
  logout: () => api.post("/auth/logout/"),
  me: () => api.get("/auth/me/"),
  recoverPassword: (email: string) =>
    api.post("/auth/password-reset/", { email }),
};

// ── Users ─────────────────────────────────────────────
export const usersAPI = {
  list: () => api.get("/users/"),
  get: (id: number) => api.get(`/users/${id}/`),
  update: (id: number, data: object) => api.patch(`/users/${id}/`, data),
  delete: (id: number) => api.delete(`/users/${id}/`),
  updateInstrument: (instrument: string) =>
    api.patch("/users/me/instrument/", { instrument }),
};

// ── Instruments ───────────────────────────────────────
export const instrumentsAPI = {
  list: () => api.get("/instruments/"),
  get: (id: number) => api.get(`/instruments/${id}/`),
  create: (data: object) => api.post("/instruments/", data),
  update: (id: number, data: object) => api.patch(`/instruments/${id}/`, data),
  delete: (id: number) => api.delete(`/instruments/${id}/`),
};

// ── Lessons ───────────────────────────────────────────
export const lessonsAPI = {
  list: (params?: object) => api.get("/lessons/", { params }),
  get: (id: number) => api.get(`/lessons/${id}/`),
  create: (data: object) => api.post("/lessons/", data),
  update: (id: number, data: object) => api.patch(`/lessons/${id}/`, data),
  delete: (id: number) => api.delete(`/lessons/${id}/`),
  complete: (id: number) => api.post(`/lessons/${id}/complete/`),
};

// ── Evaluations / Assessment ──────────────────────────
export const assessmentAPI = {
  getInitial: () => api.get("/assessment/initial/"),
  submitInitial: (answers: object[]) =>
    api.post("/assessment/initial/submit/", { answers }),
  getModuleEval: (moduleId: number) => api.get(`/assessment/module/${moduleId}/`),
  submitModuleEval: (moduleId: number, answers: object[]) =>
    api.post(`/assessment/module/${moduleId}/submit/`, { answers }),
};

// ── Exercises ─────────────────────────────────────────
export const exercisesAPI = {
  list: (params?: object) => api.get("/exercises/", { params }),
  get: (id: number) => api.get(`/exercises/${id}/`),
  submit: (id: number, answer: string) =>
    api.post(`/exercises/${id}/submit/`, { answer }),
};

// ── Progress ──────────────────────────────────────────
export const progressAPI = {
  get: () => api.get("/progress/"),
  getStats: () => api.get("/progress/stats/"),
  getHistory: () => api.get("/progress/history/"),
};

// ── Gamification ──────────────────────────────────────
export const gamificationAPI = {
  getChallenges: () => api.get("/challenges/"),
  completeChallenge: (id: number) => api.post(`/challenges/${id}/complete/`),
  getBadges: () => api.get("/badges/"),
  getUserBadges: () => api.get("/badges/user/"),
  getRanking: () => api.get("/ranking/"),
};

// ── AI Analysis ───────────────────────────────────────
export const aiAPI = {
  analyzePerformance: (data: object) => api.post("/ai/analyze/", data),
  getRecommendations: () => api.get("/ai/recommendations/"),
  submitAudio: (formData: FormData) =>
    api.post("/ai/audio/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

// ── Community ─────────────────────────────────────────
export const communityAPI = {
  list: () => api.get("/community/"),
  get: (id: number) => api.get(`/community/${id}/`),
  join: (id: number) => api.post(`/community/${id}/join/`),
};

// ── Admin ─────────────────────────────────────────────
export const adminAPI = {
  getStats: () => api.get("/admin/stats/"),
  getUsers: () => api.get("/admin/users/"),
  updateUser: (id: number, data: object) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}/`),
  getLessons: () => api.get("/admin/lessons/"),
  createLesson: (data: object) => api.post("/admin/lessons/", data),
  updateLesson: (id: number, data: object) => api.patch(`/admin/lessons/${id}/`, data),
  deleteLesson: (id: number) => api.delete(`/admin/lessons/${id}/`),
  getPlatformStats: () => api.get("/admin/platform-stats/"),
};

export default api;
