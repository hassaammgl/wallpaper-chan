import axios from "axios";
import UseAuthStore from "./authStore";

const apiRequest = axios.create({
    baseURL: import.meta.env.VITE_API_ENDPOINT,
    withCredentials: true,
})

apiRequest.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const { removeCurrentUser } = UseAuthStore.getState()
            removeCurrentUser()
        }
        return Promise.reject(error)
    }
)

export default apiRequest;
