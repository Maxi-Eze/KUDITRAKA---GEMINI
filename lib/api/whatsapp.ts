import { client } from './client';

export interface WhatsAppLinkStatus {
  phone: string | null;
  linked: boolean;
}

export const whatsappApi = {
  getStatus: () =>
    client.get<WhatsAppLinkStatus>('/whatsapp/status'),

  link: (phone: string) =>
    client.post<{ phone: string }>('/whatsapp/link', { phone }),
};