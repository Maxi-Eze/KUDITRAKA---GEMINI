import { client } from './client';
import type { User } from '../types';

export const authApi = {
  register: (data: { name: string; email: string; password: string; business_name: string }) =>
    client.post<{ userId: string }>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    client.post<{ token: string; user: User }>('/auth/login', data),

  getProfile: () =>
    client.get<User>('/auth/me'),

  completeOnboarding: (data: { business_sector: string; inventory_enabled: boolean }) =>
    client.put('/auth/onboarding', data),

  updateProfile: (data: Partial<User>) =>
    client.put<User>('/auth/profile', data),
};
