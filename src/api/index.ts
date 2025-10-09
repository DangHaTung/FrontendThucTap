import axios from "axios";

const api = axios.create({
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    },
    baseURL: import.meta.env.VITE_PUBLIC_URL || "http://localhost:3000/api/"
})

// Interceptor để thêm token vào mọi request
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token hết hạn hoặc không hợp lệ
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api