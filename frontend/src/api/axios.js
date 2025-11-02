import axios from "axios";

// Create a single configured Axios instance
const api = axios.create({
  baseURL: "/api", // all requests go through the proxy
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token (if logged in)
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

export default api;
