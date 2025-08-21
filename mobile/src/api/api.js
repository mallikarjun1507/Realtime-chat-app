// src/api/api.js
import axios from "axios";
import { API_BASE_URL } from "../config";
import { getToken } from "../utils/storage";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL, // e.g.   baseURL: 'http://192.168.0.116:5000/api'
  timeout: 10000,
});

// Interceptor: attach JWT only for protected routes
api.interceptors.request.use(
  async (config) => {
    // Skip adding token for login and register endpoints
    if (
      !config.url.includes("/auth/login") &&
      !config.url.includes("/auth/register")
    ) {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);



// Fetch all conversations for current user
//export const getConversationsApi = () => api.get("/conversations");


// --- Auth APIs ---
export const registerApi = (payload) => api.post("/auth/register", payload);
export const loginApi = (payload) => api.post("/auth/login", payload);

// --- User APIs ---
export const getUsersApi = () => api.get("/users");

// --- Chat APIs ---
export const getMessagesApi = (otherUserId) =>
  api.get(`/conversations/${otherUserId}/messages`);

export default api;
