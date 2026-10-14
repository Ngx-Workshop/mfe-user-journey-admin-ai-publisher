import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { concatMap, defaultIfEmpty, defer, exhaustMap, finalize, from, Observable, Subject, tap } from 'rxjs';
import { PublishingStore } from '../state/publishing.store';
import { PublishingReceipt, WorkshopDraft, WorkshopImage, GenerateWorkshopDraftInput } from '../models/publishing.models';

@Injectable()
export class PublishingViewModel {
  private readonly store = inject(PublishingStore);
  private readonly commands = new Subject<() => Observable<unknown>>();
  readonly catalog = this.store.catalog;
  readonly history = this.store.history;
  readonly unconfirmedRequests = this.store.unconfirmedRequests;
  readonly images = this.store.images;
  readonly sections = this.store.sections;
  readonly busy = this.store.busy;
  readonly error = this.store.error;
  readonly setupErrors = signal<string[]>([]);
  readonly initializing = signal(false);
  readonly image = signal<WorkshopImage | null>(null);
  readonly validation = signal('');
  readonly draft = signal<WorkshopDraft | null>(null);
  readonly receipt = signal<PublishingReceipt | null>(null);
  readonly requestId = signal(crypto.randomUUID());
  readonly attempted = signal(false);
  readonly imageQuery = new FormControl('', { nonNullable: true });
  readonly imagePrompt = new FormControl('', {
    nonNullable: true, validators: [Validators.required, Validators.maxLength(4000)],
  });
  readonly model = new FormControl('', {
    nonNullable: true, validators: [Validators.required],
  });
  readonly receiptId = new FormControl('', { nonNullable: true });
  readonly json = new FormControl('', { nonNullable: true });
  readonly form = new FormGroup({
    brief: new FormControl('', {
      nonNullable: true, validators: [Validators.required, Validators.maxLength(20000)],
    }),
    sectionId: new FormControl('', {
      nonNullable: true, validators: [Validators.required, Validators.maxLength(120)],
    }),
    level: new FormControl(1, {
      nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(20)],
    }),
  });

  constructor() {
    // Use the federated core's context, not implicit injection in a secondary entry point.
    const destroyRef = inject(DestroyRef);
    this.commands.pipe(
      exhaustMap((operation) => defer(operation)),
      takeUntilDestroyed(destroyRef)
    ).subscribe();
    this.json.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => this.edited());
  }
  initialize(): void {
    if (this.busy() || this.initializing()) return;
    this.commands.next(() => {
      this.initializing.set(true);
      this.setupErrors.set([]);
      const reads: (() => Observable<unknown>)[] = [
        () => this.store.loadSections(),
        () => this.store.loadModels(),
        () => this.store.loadHistory(),
      ];
      return from(reads).pipe(
        concatMap((read) => defer(read).pipe(
          defaultIfEmpty(undefined),
          tap(() => {
            if (this.error()) this.setupErrors.update((errors) => [...errors, this.error()]);
          })
        )),
        tap({ complete: () => {
          const catalog = this.catalog();
          if (!this.model.value && catalog?.defaultModel) this.model.setValue(catalog.defaultModel);
        } }),
        finalize(() => this.initializing.set(false))
      );
    });
  }
  loadHistory(): void {
    this.commands.next(() => this.store.loadHistory());
  }
  browseImages(): void {
    if (this.attempted()) return;
    this.commands.next(() => this.store.loadImages(this.imageQuery.value.trim().slice(0, 120)));
  }
  selectImage(image: WorkshopImage): void {
    if (!this.busy() && !this.attempted()) this.image.set(image);
  }
  generateImage(): void {
    if (this.busy() || this.attempted() || this.imagePrompt.invalid) return;
    this.commands.next(() => this.store.generateImage(
      this.imagePrompt.value.trim(), 'workshop-image.png'
    ).pipe(tap((image) => this.image.set(image))));
  }
  applyImage(): void {
    const image = this.image();
    const draft = this.draft();
    if (!image || !draft?.pages.length || this.busy() || this.attempted()) return;
    const updated = structuredClone(draft);
    const blocks = updated.pages[0].blocks;
    blocks.unshift({
      blockId: crypto.randomUUID(), sortIndex: 0,
      componentInstanceName: 'NgxEditorJs2ImageComponent', savedAction: 'center',
      dataClean: JSON.stringify({ url: image.storageUrl, title: image.name }),
    });
    blocks.forEach((block, index) => (block.sortIndex = index));
    // Keep failed edits in the control; only server validation restores review.
    this.json.setValue(JSON.stringify(updated, null, 2));
    this.validate();
  }
  inspectHistory(id: string): void {
    if (this.busy()) return;
    this.receiptId.setValue(id);
    this.inspect();
  }
  generate(): void {
    if (this.form.invalid || this.model.invalid || this.initializing() || this.busy() || this.attempted()) {
      this.form.markAllAsTouched();
      return;
    }
    this.commands.next(() => this.store.draft('generate_workshop_draft', {
      ...this.form.getRawValue(), model: this.model.value,
    } satisfies GenerateWorkshopDraftInput).pipe(tap((draft) => this.accept(draft))));
  }
  validate(): void {
    if (this.busy() || this.attempted()) return;
    let value: unknown;
    try {
      value = JSON.parse(this.json.value);
    } catch {
      this.validation.set('Draft must contain valid JSON.');
      return;
    }
    this.commands.next(() => this.store.draft('validate_workshop_draft', {
      draft: value,
    }).pipe(tap((draft) => this.accept(draft))));
  }
  edited(): void {
    this.draft.set(null);
  }
  private accept(draft: WorkshopDraft): void {
    this.json.setValue(JSON.stringify(draft, null, 2), { emitEvent: false });
    this.draft.set(draft);
    this.validation.set('');
    this.receipt.set(null);
  }
  publish(): void {
    const draft = this.draft();
    if (!draft || this.busy() || this.initializing() || this.attempted()) return;
    this.commands.next(() => {
      this.attempted.set(true);
      return this.store.publish({ requestId: this.requestId(), draft }).pipe(
        tap((receipt) => this.receipt.set(receipt))
      );
    });
  }
  inspect(): void {
    if (this.busy()) return;
    const id = this.receiptId.value.trim() || this.requestId();
    if (!/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id)) {
      this.validation.set('Enter a valid publishing request ID.');
      return;
    }
    this.commands.next(() => this.store.receipt(id).pipe(tap((receipt) => this.receipt.set(receipt))));
  }
  newDraft(): void {
    if (this.busy()) return;
    this.requestId.set(crypto.randomUUID());
    this.attempted.set(false);
    this.receipt.set(null);
    this.json.setValue('');
    this.image.set(null);
    this.receiptId.setValue('');
    this.validation.set('');
  }
}
