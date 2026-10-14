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
  WorkshopImage,
  GenerateWorkshopDraftInput,
} from '../models/publishing.models';
@Injectable()
export class PublishingViewModel {
  private readonly store = inject(PublishingStore);
  private alive = true;
  readonly catalog = this.store.catalog;
  readonly history = this.store.history;
  readonly unconfirmedRequests = this.store.unconfirmedRequests;
  readonly images = this.store.images;
  readonly setupErrors = signal<string[]>([]);
  readonly initializing = signal(false);
  readonly image = signal<WorkshopImage | null>(null);
  readonly imageQuery = new FormControl('', { nonNullable: true });
  readonly imagePrompt = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(4000)],
  });
  readonly model = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  async initialize(): Promise<void> {
    if (this.busy() || this.initializing()) return;
    this.initializing.set(true);
    this.setupErrors.set([]);
    try {
      for (const read of [
        () => this.store.loadSections(),
        () => this.store.loadModels(),
        () => this.store.loadHistory(),
      ]) {
        if (!this.alive) return;
        await read();
        if (this.alive && this.error())
          this.setupErrors.update((errors) => [
            ...errors,
            this.error(),
          ]);
      }
      const catalog = this.catalog();
      if (this.alive && !this.model.value && catalog?.defaultModel)
        this.model.setValue(catalog.defaultModel);
    } finally {
      if (this.alive) this.initializing.set(false);
    }
  }
  loadHistory(): Promise<void> {
    return this.store.loadHistory();
  }
  browseImages(): Promise<void> {
    return this.store.loadImages(
      this.imageQuery.value.trim().slice(0, 120)
    );
  }
  selectImage(image: WorkshopImage): void {
    if (this.busy() || this.attempted()) return;
    this.image.set(image);
  }
  async generateImage(): Promise<void> {
    if (this.busy() || this.attempted() || this.imagePrompt.invalid)
      return;
    const image = await this.store.generateImage(
      this.imagePrompt.value.trim(),
      'workshop-image.png'
    );
    if (image && this.alive) this.image.set(image);
  }
  async applyImage(): Promise<void> {
    const image = this.image();
    const draft = this.draft();
    if (
      !image ||
      !draft?.pages.length ||
      this.busy() ||
      this.attempted()
    )
      return;
    const updated = structuredClone(draft);
    const blocks = updated.pages[0].blocks;
    blocks.unshift({
      blockId: crypto.randomUUID(),
      sortIndex: 0,
      componentInstanceName: 'NgxEditorJs2ImageComponent',
      savedAction: 'center',
      dataClean: JSON.stringify({
        url: image.storageUrl,
        title: image.name,
      }),
    });
    blocks.forEach((block, index) => (block.sortIndex = index));
    // Preserve a failed image edit for correction; reviewed status requires server validation.
    this.json.setValue(JSON.stringify(updated, null, 2));
    this.edited();
    await this.validate();
  }
  inspectHistory(id: string): Promise<void> {
    this.receiptId.setValue(id);
    return this.inspect();
  }
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
    if (
      this.form.invalid ||
      this.model.invalid ||
      this.initializing() ||
      this.busy() ||
      this.attempted()
    ) {
      this.form.markAllAsTouched();
      return;
    }
    const draft = await this.store.draft('generate_workshop_draft', {
      ...this.form.getRawValue(),
      model: this.model.value,
    } satisfies GenerateWorkshopDraftInput);
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
    this.image.set(null);
    this.receiptId.setValue('');
    this.validation.set('');
  }
  resource(value: unknown): string {
    return JSON.stringify(value, null, 2);
  }
}
