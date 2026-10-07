import { z } from 'zod';

export const CHAT_MESSAGE_MAX = 1000;

export const chatMessageSchema = z
  .string()
  .trim()
  .min(1, 'Message is required')
  .max(CHAT_MESSAGE_MAX, `Message must be ${CHAT_MESSAGE_MAX} characters or fewer`);
