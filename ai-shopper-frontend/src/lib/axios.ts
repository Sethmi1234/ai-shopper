import axios from "axios";
import { encryptData, decryptData } from "./encryption";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Flag to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - attach access token and encrypt body
api.interceptors.request.use(
  async (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Encrypt payload if data exists and is a plain object
    if (config.data && !(config.data instanceof FormData)) {
      try {
        const encrypted = await encryptData(config.data);
        config.data = { payload: encrypted };
      } catch (e) {
        console.error("Encryption error:", e);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - decrypt body, handle 401 and auto-refresh
api.interceptors.response.use(
  async (response) => {
    if (response.data && response.data.payload) {
      try {
        const decrypted = await decryptData(response.data.payload);
        response.data = decrypted;
      } catch (e) {
        console.error("Decryption error:", e);
      }
    }
    return response;
  },
  async (error) => {
    // If there is an encrypted error payload, decrypt it for correct error message
    if (error.response?.data?.payload) {
      try {
        const decryptedError = await decryptData(error.response.data.payload);
        error.response.data = decryptedError;
      } catch (e) {
        // If decryption fails, keep the original error payload
      }
    }

    const originalRequest = error.config;

    // Auth endpoints should NEVER trigger a refresh — just reject directly
    const isAuthEndpoint =
      originalRequest.url === "/auth/login" ||
      originalRequest.url === "/auth/register" ||
      originalRequest.url === "/auth/refresh";

    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Only attempt token refresh if the user was previously logged in
    const hasAccessToken =
      typeof window !== "undefined" && !!localStorage.getItem("accessToken");

    // If 401 and not already retried and user was logged in
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      hasAccessToken
    ) {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // refreshToken is sent automatically via HttpOnly cookie
        const { refreshToken: refresh } = await import(
          "../services/auth.service"
        );
        const response = await refresh();
        const newAccessToken = response.accessToken;

        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", newAccessToken);
        }

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("user");
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;