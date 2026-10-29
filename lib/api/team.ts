import { client } from './client';
import type { SalesSummary, StaffRole, TeamMember, TeamMemberDetail } from '../types';

export interface AddStaffData {
  name: string;
  phone: string;
  role: StaffRole;
}

/** The PIN is only ever returned here, once. */
export interface StaffWithPin {
  member: TeamMember;
  pin: string;
}

export const teamApi = {
  list: () => client.get<TeamMember[]>('/team'),
  add: (data: AddStaffData) => client.post<StaffWithPin>('/team', data),
  detail: (id: string) => client.get<TeamMemberDetail>(`/team/${id}`),
  newPin: (id: string) => client.post<StaffWithPin>(`/team/${id}/pin`, {}),
  remove: (id: string) => client.delete(`/team/${id}`),
  me: () => client.get<{ today: SalesSummary } | null>('/team/me'),
};
