import { client } from './client';
import type { User } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  business_name?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface OnboardingData {
  business_sector: string;
  inventory_enabled: boolean;
}

export interface ProfileUpdateData {
  name?: string;
  business_name?: string;
}

export const authApi = {
  register: (data: RegisterData) =>
    client.post<{ userId: string }>('/auth/register', data),

  login: (data: LoginData) =>
    client.post<LoginResponse>('/auth/login', data),

  getProfile: () =>
    client.get<User>('/auth/profile'),

  completeOnboarding: (data: OnboardingData) =>
    client.put('/auth/onboarding', data),

  updateProfile: (data: ProfileUpdateData) =>
    client.put<User>('/auth/profile', data),
};
