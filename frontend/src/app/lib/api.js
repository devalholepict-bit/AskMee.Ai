import axios from 'axios';

const api = axios.create({
    // In Vite, environment variables are exposed via import.meta.env
    baseURL: import.meta.env.VITE_BASE_URL || "https://askmee-ai.onrender.com",
    withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // You can attach tokens or standard headers here
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Global error handling can go here
        console.error("API Error Response:", error.response || error.message);
        return Promise.reject(error);
    }
);

export default api;
