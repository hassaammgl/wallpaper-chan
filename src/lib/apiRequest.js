"use client";

import axios from "axios";
import useAuthStore from "@/stores/authStore";

const apiRequest = axios.create({
  baseURL: "",
  withCredentials: true,
});

apiRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { removeCurrentUser } = useAuthStore.getState();
      removeCurrentUser();
    }
    return Promise.reject(error);
  }
);

export default apiRequest;
