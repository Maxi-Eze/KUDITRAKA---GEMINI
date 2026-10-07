import { ApiError } from './client';

export interface FieldErrorDetail {
  field: string;
  message: string;
}

export function getFieldErrors(error: unknown): Record<string, string> {
  const errors: Record<string, string> = {};
  if (error instanceof ApiError && Array.isArray(error.details)) {
    for (const detail of error.details as FieldErrorDetail[]) {
      if (
        detail &&
        typeof detail === 'object' &&
        'field' in detail &&
        'message' in detail &&
        typeof detail.field === 'string'
      ) {
        if (!errors[detail.field]) {
          errors[detail.field] = String(detail.message);
        }
      }
    }
  }
  return errors;
}
