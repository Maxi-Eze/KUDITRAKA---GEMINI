import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://kudi-v2-xah5.onrender.com/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const instance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ai-bk-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ai-bk-token');
      window.location.href = '/';
    }
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Request failed';
    const status = error.response?.status || 500;
    throw new ApiError(message, status);
  },
);

export const client = {
  get: <T>(url: string) => instance.get<T>(url).then((r) => r.data),
  post: <T>(url: string, data: unknown) => instance.post<T>(url, data).then((r) => r.data),
  put: <T>(url: string, data: unknown) => instance.put<T>(url, data).then((r) => r.data),
  patch: <T>(url: string, data: unknown) => instance.patch<T>(url, data).then((r) => r.data),
  delete: <T>(url: string) => instance.delete<T>(url).then((r) => r.data),
};
