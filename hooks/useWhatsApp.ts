'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { whatsappApi } from '@/lib/api';
import { queryKeys } from './keys';

export function useWhatsAppStatus() {
  return useQuery({
    queryKey: queryKeys.whatsapp.status(),
    queryFn: whatsappApi.getStatus,
  });
}

export function useLinkWhatsApp() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phone: string) => whatsappApi.link(phone),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.whatsapp.all });
    },
  });
}