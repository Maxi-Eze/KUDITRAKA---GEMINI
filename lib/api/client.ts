import axios, { type AxiosResponse } from 'axios';
import type { Pagination } from '../types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://misa.kuditraka.name.ng/api';

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: Pagination;
}

interface MetaResponse<T> {
  data: T;
  pagination?: Pagination;
  message?: string;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
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

function isEnvelope(body: unknown): body is ApiEnvelope<unknown> {
  return (
    !!body &&
    typeof body === 'object' &&
    !Array.isArray(body) &&
    'success' in body &&
    'data' in body
  );
}

instance.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (isEnvelope(body)) {
      (response as AxiosResponse & { pagination?: Pagination }).pagination = body.pagination;
      response.data = body.data;
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ai-bk-token');
      window.location.href = '/';
    }
    const body = error.response?.data;
    const message =
      (typeof body?.error === 'string' ? body.error : body?.error?.message) ||
      body?.message ||
      error.message ||
      'Request failed';
    const status = error.response?.status || 500;
    throw new ApiError(message, status, body?.details ?? body?.errors);
  },
);

export const client = {
  get: <T>(url: string) => instance.get<T>(url).then((r) => r.data),
  getWithMeta: <T>(url: string): Promise<MetaResponse<T>> =>
    instance.get<T>(url).then((r) => ({
      data: r.data,
      pagination: (r as AxiosResponse & { pagination?: Pagination }).pagination,
    })),
  post: <T>(url: string, data: unknown) => instance.post<T>(url, data).then((r) => r.data),
  put: <T>(url: string, data: unknown) => instance.put<T>(url, data).then((r) => r.data),
  patch: <T>(url: string, data: unknown) => instance.patch<T>(url, data).then((r) => r.data),
  delete: <T>(url: string) => instance.delete<T>(url).then((r) => r.data),
};
