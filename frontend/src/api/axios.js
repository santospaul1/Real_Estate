// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

// Attach token before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired access token automatically
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // if unauthorized & we haven’t retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refresh = localStorage.getItem("refresh");
        if (!refresh) {
          // no refresh token, log user out
          localStorage.clear();
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // request new access token
        const response = await axios.post("http://127.0.0.1:8000/api/token/refresh/", {
          refresh,
        });

        // save new access token
        localStorage.setItem("accessToken", response.data.access);

        // retry original request with new token
        originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        // refresh also failed, force logout
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
