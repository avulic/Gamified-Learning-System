import axios from "axios";
import type { AxiosInstance } from "axios";

const ApiService: AxiosInstance = axios.create({
    baseURL: "http://localhost:4000/api",
    headers: {
        "Content-type": "application/json",
    }
});

// Request interceptor
ApiService.interceptors.request.use(
    (config) => {
        // Add your logic here, such as setting headers or handling authentication tokens
        return config;
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

// Response interceptor
ApiService.interceptors.response.use(
    (response) => {
        // Handle successful responses
        return response;
    },
    (error) => {
        // Handle error responses
        return Promise.reject(error);
    }
);

export default ApiService;