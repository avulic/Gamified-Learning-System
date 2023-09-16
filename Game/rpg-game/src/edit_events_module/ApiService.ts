import axios from "axios";
import type { AxiosInstance } from "axios";


const ApiService: AxiosInstance = axios.create({
    baseURL: "http://localhost:4000/api",
    headers: {
        "Content-type": "application/json"
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
        // if (400 === error.response.status) {
        //     //router.push("/logout");
        //     console.log("Error 400");
        //     return Promise.resolve(error.response);
        // } 
        // else if (401 === error.response.status) {
        //     router.push("/signin");
        //     console.log("Error 401");
        //     return Promise.resolve(error.response);
        // } 
        // else if (402 === error.response.status) {
        //     //router.push("/logout");
        //     console.log("Error 402");
        //     return Promise.resolve(error.response);
        // } 
        // else if (403 === error.response.status) {
        //     //router.push("/logout");
        //     // logoutService.logout()
        //     console.log("Error 403");
        //     return Promise.resolve(error.response);
        // } 
        // else {
        //     return Promise.reject(error);
        // }
    }
);

export default ApiService;