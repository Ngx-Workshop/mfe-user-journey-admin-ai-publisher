import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { PublishingStore } from '../state/publishing.store';
import { PublishingReceipt } from '../models/publishing.models';
import { publishingProgress, publishingStepLabel } from '../utils/publishing-step-display';

@Injectable()
export class ReceiptViewModel {
  private readonly store = inject(PublishingStore);
  private readonly requests = new Subject<string>();
  readonly requestId = signal('');
  readonly invalid = signal(false);
  readonly receipt = signal<PublishingReceipt | null>(null);
  readonly busy = this.store.busy;
  readonly error = computed(() => this.invalid() ? 'Enter a valid publishing request ID.' : this.store.error());
  readonly progress = computed(() => publishingProgress(this.receipt()?.steps ?? []));
  readonly steps = computed(() => (this.receipt()?.steps ?? []).map((step) => ({
    ...step, label: publishingStepLabel(step.name),
  })));
  constructor() {
    this.requests.pipe(switchMap((id) => defer(() => {
      this.requestId.set(id);
      this.receipt.set(null);
      this.invalid.set(!/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id));
      return this.invalid() ? EMPTY : this.store.receipt(id).pipe(tap((receipt) => this.receipt.set(receipt)));
    })), takeUntilDestroyed(inject(DestroyRef))).subscribe();
  }
  load(id: string): void { this.requests.next(id); }
  refresh(): void { this.load(this.requestId()); }
}
