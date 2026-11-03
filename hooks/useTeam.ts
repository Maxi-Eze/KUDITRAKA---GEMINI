'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { teamApi, type AddStaffData } from '@/lib/api/team';
import { queryKeys } from './keys';
import type { StaffRight, StaffRole } from '@/lib/types';

/** Owner: the team with today's sales. */
export function useTeam(enabled = true) {
  return useQuery({
    queryKey: queryKeys.team.list(),
    queryFn: teamApi.list,
    enabled,
  });
}

export function useTeamMember(id: string | null) {
  return useQuery({
    queryKey: queryKeys.team.detail(id || ''),
    queryFn: () => teamApi.detail(id as string),
    enabled: !!id,
  });
}

/** Staff: their own sales today. */
export function useMySummary(enabled = true) {
  return useQuery({
    queryKey: queryKeys.team.me(),
    queryFn: teamApi.me,
    enabled,
    refetchInterval: 60_000,
  });
}

export function useAddStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddStaffData) => teamApi.add(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team.all }),
    onError: (error: Error) => toast.error(error.message || 'Could not add staff'),
  });
}

export function useNewPin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.newPin(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team.all }),
    onError: (error: Error) => toast.error(error.message || 'Could not make a new PIN'),
  });
}

export function useUpdateRights() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; role: StaffRole; permissions: StaffRight[] }) => teamApi.updateRights(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team.all }),
    onError: (error: Error) => toast.error(error.message || 'Could not save the changes'),
  });
}

export function useRemoveStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.team.all }),
    onError: (error: Error) => toast.error(error.message || 'Could not remove staff'),
  });
}
