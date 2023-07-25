import axios from "axios";
import type {AxiosInstance} from "axios";

const apiClient: AxiosInstance = axios.create({
    baseURL: "http://localhost:4000/",
    headers: {
        "Content-type": "application/json",
    },
});

export default apiClient;