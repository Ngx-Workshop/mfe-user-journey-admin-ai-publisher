import {
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PublishingStore } from '../state/publishing.store';
import {
  PublishingReceipt,
  WorkshopDraft,
} from '../models/publishing.models';
@Injectable()
export class PublishingViewModel {
  private readonly store = inject(PublishingStore);
  private alive = true;
  readonly sections = this.store.sections;
  loadSections(): Promise<void> {
    return this.store.loadSections();
  }
  readonly busy = this.store.busy;
  readonly error = this.store.error;
  readonly validation = signal('');
  readonly draft = signal<WorkshopDraft | null>(null);
  readonly receipt = signal<PublishingReceipt | null>(null);
  readonly requestId = signal(crypto.randomUUID());
  readonly attempted = signal(false);
  readonly receiptId = new FormControl('', { nonNullable: true });
  readonly json = new FormControl('', { nonNullable: true });
  readonly form = new FormGroup({
    brief: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(20000)],
    }),
    sectionId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    level: new FormControl(1, {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.min(1),
        Validators.max(20),
      ],
    }),
  });
  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
    });
  }
  async generate(): Promise<void> {
    if (this.form.invalid || this.busy() || this.attempted()) {
      this.form.markAllAsTouched();
      return;
    }
    const draft = await this.store.draft(
      'generate_workshop_draft',
      this.form.getRawValue()
    );
    if (draft && this.alive) this.accept(draft);
  }
  async validate(): Promise<void> {
    if (this.busy() || this.attempted()) return;
    let value: unknown;
    try {
      value = JSON.parse(this.json.value);
    } catch {
      this.validation.set('Draft must contain valid JSON.');
      return;
    }
    const draft = await this.store.draft('validate_workshop_draft', {
      draft: value,
    });
    if (draft && this.alive) this.accept(draft);
  }
  edited(): void {
    this.draft.set(null);
  }
  private accept(draft: WorkshopDraft): void {
    this.draft.set(draft);
    this.json.setValue(JSON.stringify(draft, null, 2));
    this.validation.set('');
    this.receipt.set(null);
  }
  async publish(): Promise<void> {
    const draft = this.draft();
    if (!draft || this.busy() || this.attempted()) return;
    this.attempted.set(true);
    const receipt = await this.store.publish({
      requestId: this.requestId(),
      draft,
    });
    if (receipt && this.alive) this.receipt.set(receipt);
  }
  async inspect(): Promise<void> {
    const id = this.receiptId.value.trim() || this.requestId();
    if (!/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id)) {
      this.validation.set('Enter a valid publishing request ID.');
      return;
    }
    const receipt = await this.store.receipt(id);
    if (receipt && this.alive) this.receipt.set(receipt);
  }
  newDraft(): void {
    if (this.busy()) return;
    this.requestId.set(crypto.randomUUID());
    this.attempted.set(false);
    this.receipt.set(null);
    this.draft.set(null);
    this.json.setValue('');
  }
  resource(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
}
