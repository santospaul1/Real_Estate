import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Django API
});

// Add access token if exists
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

console.log("Token in axios:", localStorage.getItem("accessToken"));


export default api;
