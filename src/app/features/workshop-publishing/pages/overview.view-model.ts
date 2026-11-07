import { SavedDraftsStore } from '../state/saved-drafts.store';
import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concat, defer, exhaustMap, Observable, Subject } from 'rxjs';
import { workshopSummary } from '../utils/publishing-workshop-summary';
import { PublishingStore } from '../state/publishing.store';
import {
  publishingProgress,
  publishingStepLabel,
} from '../utils/publishing-step-display';

import { HistoryFilter, HistoryRow } from '../models/history.models';

@Injectable()
export class OverviewViewModel {
  readonly drafts = inject(SavedDraftsStore);
  private readonly store = inject(PublishingStore);
  private readonly commands = new Subject<
    () => Observable<unknown>
  >();
  readonly busy = this.store.busy;
  readonly error = this.store.error;
  readonly search = signal('');
  readonly status = signal<HistoryFilter>('all');
  readonly rows = computed<HistoryRow[]>(() => [
    ...this.store
      .unconfirmedRequests()
      .filter(
        (id) =>
          !this.store.history().some((run) => run.requestId === id)
      )
      .map((requestId) => ({
        requestId,
        status: 'unconfirmed' as const,
        message: 'Check the receipt to confirm the result.',
        steps: [],
        summary: 'Publishing result not confirmed.',
      })),
    ...this.store.history().map((run) => ({
      requestId: run.requestId,
      status: run.status,
      message: run.message ?? '',
      steps: run.steps.flatMap((step) => [
        step.name,
        publishingStepLabel(step.name),
      ]),
      summary: publishingProgress(run.steps),
      ...workshopSummary(run.steps),
    })),
  ]);
  readonly filtered = computed(() => {
    const query = this.search().trim().toLowerCase();
    return this.rows().filter(
      (row) =>
        (this.status() === 'all' || row.status === this.status()) &&
        [
          row.workshopName ?? '',
          row.requestId,
          row.message,
          row.summary,
          ...row.steps,
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
    );
  });
  constructor() {
    this.commands
      .pipe(
        exhaustMap((command) => defer(command)),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe();
  }
  refresh(): void {
    this.commands.next(() =>
      concat(this.drafts.load(), this.store.loadHistory())
    );
  }
  loadMoreDrafts(): void {
    this.commands.next(() => this.drafts.load(true));
  }
  clearFilters(): void {
    this.search.set('');
    this.status.set('all');
  }
}
