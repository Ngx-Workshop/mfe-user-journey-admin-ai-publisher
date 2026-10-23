import type { PublishingReceipt } from './publishing.models';

export type HistoryStatus = PublishingReceipt['status'] | 'unconfirmed';
export type HistoryFilter = HistoryStatus | 'all';
export interface HistoryRow {
  requestId: string;
  status: HistoryStatus;
  message: string;
  steps: readonly string[];
  summary: string;
}

