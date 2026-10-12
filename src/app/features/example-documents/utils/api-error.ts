import { HttpErrorResponse } from '@angular/common/http';

export function apiError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Could not reach the service. Check your connection and retry.';
    if (error.status === 401) return 'Your session expired. Sign in again to continue.';
    if (error.status === 403) return 'You do not have access to this operation.';
    const message: unknown = error.error?.message;
    if (typeof message === 'string') return message;
    if (Array.isArray(message) && message.every(value => typeof value === 'string')) {
      return message.join('. ');
    }
  }
  return 'Could not complete the request. Please try again.';
}
