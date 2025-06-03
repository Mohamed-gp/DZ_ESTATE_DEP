import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import toast from "react-hot-toast";

const customAxios: AxiosInstance = axios.create({
  baseURL:
    (process.env.NODE_ENV === "production"
      ? "https://gl1.production-server.tech"
      : "http://localhost:5000") + "/api",
  withCredentials: true,
});

customAxios.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh token
        const { data } = await customAxios.post("/auth/refreshToken");
        if (data.message == "Invalid refresh token. Please log in again.") {
          localStorage.removeItem("user");
          toast.error("Invalid token login again");
          window.location.href = "/auth/login";
        }

        // Retry original request with new token
        return customAxios(originalRequest);
      } catch (refreshError) {
        // Redirect to login on refresh failure
        // window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default customAxios;
