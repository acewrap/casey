import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/',
    // In a real app, we would handle auth via a token flow.
    // For this demo, we assume the backend is configured to accept session cookies
    // or we are bypassing auth for specific read-only endpoints in dev.
    // The previous hardcoded admin/password has been removed.
});

// Add a request interceptor to attach token if present in localStorage
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Token ${token}`;
    }
    return config;
});

export default api;
