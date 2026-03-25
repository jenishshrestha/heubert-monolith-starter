import { config } from "@shared/lib/config";
import axios, { type AxiosError, type AxiosResponse } from "axios";

export interface ApiError {
  status: number;
  message: string;
  code?: string;
}

/**
 * Axios client configured for the backend
 */
const xTenantId = import.meta.env.VITE_X_TENANT_ID;

export const apiClient = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
    ...(xTenantId && { "x-tenant-id": xTenantId }),
  },
});

// Request interceptor for adding auth tokens
apiClient.interceptors.request.use(
  (requestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }
    return requestConfig;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<{ message?: string; code?: string }>) => {
    const status = error.response?.status ?? 0;
    const apiError: ApiError = {
      status,
      message: error.response?.data?.message || error.message || "An unexpected error occurred",
      code: error.response?.data?.code,
    };

    if (status === 401) {
      localStorage.removeItem("auth_token");
      // Dispatch event so the app can handle navigation without hard reload
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }

    return Promise.reject(apiError);
  },
);

// Type-safe API request wrapper
export async function apiRequest<T>(
  method: "get" | "post" | "put" | "patch" | "delete",
  url: string,
  data?: unknown,
  params?: Record<string, unknown>,
): Promise<T> {
  const response = await apiClient.request<T>({
    method,
    url,
    data,
    params,
  });
  return response.data;
}
