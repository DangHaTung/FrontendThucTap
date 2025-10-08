import axios from "axios";

const api = axios.create({
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    },
    // baseURL: "http://localhost:3000/api"
    baseURL: import.meta.env.VITE_PUBLIC_URL
})

export default api