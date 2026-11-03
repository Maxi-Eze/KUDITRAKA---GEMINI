import { client } from './client';
import type { User } from '../types';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  business_name?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface StaffLoginData {
  phone: string;
  pin: string;
}

export interface StaffLoginResponse {
  token: string;
  staff: { member_id: string; name: string; role: string; business_name: string | null };
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ProfileUpdateData {
  name?: string;
  business_name?: string;
  business_sector?: string;
  phone?: string;
  inventory_enabled?: boolean;
}

export interface OnboardingData {
  business_sector: string;
  inventory_enabled: boolean;
}

export const authApi = {
  register: (data: RegisterData) =>
    client.post<{ userId: string }>('/auth/register', data),

  login: (data: LoginData) =>
    client.post<LoginResponse>('/auth/login', data),

  staffLogin: (data: StaffLoginData) =>
    client.post<StaffLoginResponse>('/auth/staff-login', data),

  getProfile: () =>
    client.get<User>('/auth/profile'),

  completeOnboarding: (data: OnboardingData) =>
    client.put<null>('/auth/onboarding', data),

  updateProfile: (data: ProfileUpdateData) =>
    client.put<User>('/auth/profile', data),
};
