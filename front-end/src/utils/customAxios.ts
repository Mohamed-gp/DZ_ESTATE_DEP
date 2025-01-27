import axios, { 
  AxiosInstance, 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig 
} from "axios";

const customAxios: AxiosInstance = axios.create({
  baseURL: (process.env.NODE_ENV === "production" ? "https://gl1.production-server.tech" : "http://localhost:3005") + "/api",
  withCredentials: true
});

customAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        await customAxios.post("/auth/refreshToken");

        // Retry original request with new token
        return customAxios(originalRequest);
      } catch (refreshError) {
        // Redirect to login on refresh failure
        console.log(refreshError)
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default customAxios;