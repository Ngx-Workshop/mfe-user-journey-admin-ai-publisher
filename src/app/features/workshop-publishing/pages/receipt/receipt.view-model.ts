import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { defer, EMPTY, Subject, switchMap, tap } from 'rxjs';
import { documentEditorUrl } from '../../utils/publishing-document-link';
import { PublishingStore } from '../../state/publishing.store';
import { PublishingReceipt } from '../../models/publishing.models';
import {
  codingLabEditorUrl,
  labVerification,
} from '../../utils/publishing-verification';
import {
  publishingProgress,
  publishingStepLabel,
} from '../../utils/publishing-step-display';

@Injectable()
export class ReceiptViewModel {
  private readonly store = inject(PublishingStore);
  private readonly requests = new Subject<string>();
  readonly requestId = signal('');
  readonly invalid = signal(false);
  readonly selectedIndex = signal(0);
  readonly receipt = signal<PublishingReceipt | null>(null);
  readonly busy = this.store.busy;
  readonly error = computed(() =>
    this.invalid()
      ? 'Enter a valid publishing request ID.'
      : this.store.error()
  );
  readonly progress = computed(() =>
    publishingProgress(this.receipt()?.steps ?? [])
  );
  readonly steps = computed(() =>
    (this.receipt()?.steps ?? []).map((step) => ({
      ...step,
      label: publishingStepLabel(step.name),
      verification: labVerification(step),
      documentEditorUrl: documentEditorUrl(
        step,
        this.receipt()?.steps ?? []
      ),
      labEditorUrl: codingLabEditorUrl(
        step,
        this.receipt()?.steps ?? []
      ),
    }))
  );
  readonly failedVerifications = computed(() =>
    this.steps().filter((step) => step.verification?.passed === false)
  );
  readonly selectedStep = computed(
    () => this.steps()[this.selectedIndex()] ?? null
  );
  selectStep(index: number): void {
    if (
      Number.isInteger(index) &&
      index >= 0 &&
      index < this.steps().length
    )
      this.selectedIndex.set(index);
  }
  constructor() {
    this.requests
      .pipe(
        switchMap((id) =>
          defer(() => {
            this.requestId.set(id);
            this.receipt.set(null);
            this.selectedIndex.set(0);
            this.invalid.set(
              !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id)
            );
            return this.invalid()
              ? EMPTY
              : this.store
                  .receipt(id)
                  .pipe(tap((receipt) => this.receipt.set(receipt)));
          })
        ),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe();
  }
  load(id: string): void {
    this.requests.next(id);
  }
  refresh(): void {
    this.load(this.requestId());
  }
}
