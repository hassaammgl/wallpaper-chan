import axios from 'axios'
import useAuthStore from './authStore'

const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_ENDPOINT,
  withCredentials: true,
})

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthCheck = error.config?.url?.includes('/api/auth/me')
    if (error.response?.status === 401 && !isAuthCheck) {
      useAuthStore.getState().removeCurrentUser()
    }
    return Promise.reject(error)
  }
)

export default apiRequest
