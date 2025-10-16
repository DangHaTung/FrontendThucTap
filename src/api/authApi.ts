import axios from "axios";

// Lấy baseURL từ .env (ưu tiên Vite)
const API_URL = (import.meta.env.VITE_PUBLIC_URL || "http://localhost:5000/api").replace(/\/$/, "");



// Tạo instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để tự động thêm token (nếu có)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post("/login", { email, password });
    return data; // { token, user, ... }
  },

  register: async (email: string, password: string, username: string) => {
    const { data } = await api.post("/register", { email, password, username });
    return data;
  },

  me: async () => {
    const { data } = await api.get("/me");
    return data;
  },

  updateMe: async (payload: { username?: string; avatar?: string; password?: string; confirmPassword?: string }) => {
    const { data } = await api.put("/me", payload);
    return data;
  }
};

export default api;
