import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { getHeaderConfig, clearAuthInfo, BASE_URL } from "./utils";

// Create a single axios instance
export const api = axios.create({
  baseURL: BASE_URL,
  headers: getHeaderConfig().headers, // Use default language
});

// Request interceptor to add headers dynamically
api.interceptors.request.use(
  (config) => {
    // Get current language from config or use default
    const lang = config.headers?.["lang"] || "en";
    const headers = getHeaderConfig(lang).headers;

    // Merge headers
    config.headers = {
      ...config.headers,
      ...headers,
    };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    const message = (error.response?.data as any)?.message;
    const code = (error.response?.data as any)?.code;
    const nestedError = (error.response?.data as any)?.error?.message;

    // Handle authentication errors
    if (
      error.response?.status === 401 ||
      code === 401 ||
      nestedError === "session expired" ||
      message === "Login session expired"
    ) {
      // clearAuthInfo();
      // Redirect to login (works in Vite/SPA)
      // window.location.href = "/auth/login";
    }

    return Promise.reject(error);
  },
);

// Function to update the language header dynamically
export function updateAxiosHeader(lang: string) {
  // Update the default language header
  if (api.defaults.headers) {
    api.defaults.headers["lang"] = lang;
  }
}

// Type-safe API functions
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig) => api.get<T>(url, config),

  post: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.post<T>(url, data, config),

  put: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.put<T>(url, data, config),

  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig) =>
    api.patch<T>(url, data, config),

  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    api.delete<T>(url, config),
};
