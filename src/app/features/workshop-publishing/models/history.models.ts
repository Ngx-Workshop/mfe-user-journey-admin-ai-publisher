import type { PublishingReceipt } from './publishing.models';

export type HistoryStatus =
  PublishingReceipt['status'] | 'unconfirmed' | 'draft';
export type HistoryFilter = HistoryStatus | 'all';
export interface HistoryRow {
  requestId: string;
  draftId?: string;
  updatedAt?: string;
  status: HistoryStatus;
  message: string;
  steps: readonly string[];
  summary: string;
  workshopName?: string | null;
  workshopUrl?: string | null;
}
