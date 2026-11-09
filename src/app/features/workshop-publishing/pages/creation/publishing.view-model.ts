import { DraftPersistenceViewModel } from './draft-persistence.view-model';
import { repairChanges } from '../../utils/repair-changes';
import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {
  catchError,
  EMPTY,
  map,
  of,
  concatMap,
  defaultIfEmpty,
  defer,
  exhaustMap,
  finalize,
  from,
  interval,
  Observable,
  Subject,
  tap,
} from 'rxjs';
import {
  PublishingOperation,
  publishingOperationLabels,
} from '../../models/publishing-operation';
import { PublishingStore } from '../../state/publishing.store';
import {
  PreparationReport,
  PreparationRepairOptions,
  StartWorkshopPreparationInput,
  PublishingReceipt,
  WorkshopDraft,
  WorkshopImage,
  GenerateWorkshopDraftInput,
} from '../../models/publishing.models';

@Injectable()
export class PublishingViewModel {
  private readonly store = inject(PublishingStore);
  private readonly persistence = inject(DraftPersistenceViewModel);
  private requestedDraftId?: string;
  readonly savedDraft = this.persistence.savedDraft;
  readonly saving = this.persistence.saving;
  readonly saveError = this.persistence.saveError;
  readonly unsaved = this.persistence.unsaved;
  readonly savedDraftId = this.persistence.savedDraftId;
  private readonly commands = new Subject<
    () => Observable<unknown>
  >();
  readonly catalog = this.store.catalog;
  readonly history = this.store.history;
  readonly unconfirmedRequests = this.store.unconfirmedRequests;
  readonly images = this.store.images;
  readonly sections = this.store.sections;
  readonly busy = this.store.busy;
  readonly error = this.store.error;
  private activeOperation: symbol | undefined;
  readonly operation = signal<PublishingOperation>('idle');
  readonly elapsed = signal(0);
  readonly working = computed(
    () => this.busy() || this.saving() || this.operation() !== 'idle'
  );
  readonly status = computed(() =>
    this.operation() !== 'idle'
      ? publishingOperationLabels[this.operation()]
      : this.error()
        ? 'Needs attention'
        : this.attempted()
          ? this.receipt()?.status === 'complete'
            ? 'Workshop published'
            : 'Check publishing receipt'
          : this.step() === 2
            ? 'Ready for publication'
            : this.step() === 1
              ? this.draft()
                ? 'Draft ready for review'
                : 'Validate draft changes'
              : 'Start with your workshop brief'
  );
  readonly setupErrors = signal<string[]>([]);
  readonly initializing = signal(false);
  readonly image = signal<WorkshopImage | null>(null);
  readonly preparation = signal<PreparationReport | null>(null);
  readonly repairOptions = this.store.repairOptions;
  readonly previousRepair = signal<{
    draft: WorkshopDraft;
    report: PreparationReport;
    options: PreparationRepairOptions | null;
  } | null>(null);
  readonly repairChanges = computed(() => {
    const previous = this.previousRepair();
    const draft = this.draft();
    return previous && draft
      ? repairChanges(previous.draft, draft)
      : [];
  });
  readonly checksReady = computed(
    () =>
      this.preparation()?.ready === true &&
      this.preparation()?.status === 'complete'
  );
  readonly validation = signal('');
  readonly step = signal(0);
  readonly reviewed = signal(false);
  readonly draft = signal<WorkshopDraft | null>(null);
  readonly receipt = signal<PublishingReceipt | null>(null);
  readonly requestId = signal<string>(crypto.randomUUID());
  readonly attempted = signal(false);
  readonly imageQuery = new FormControl('', { nonNullable: true });
  readonly imagePrompt = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(4000)],
  });
  readonly model = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required],
  });
  readonly receiptId = new FormControl('', { nonNullable: true });
  readonly json = this.persistence.json;
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
    // Use the federated core's context, not implicit injection in a secondary entry point.
    const destroyRef = inject(DestroyRef);
    this.commands
      .pipe(
        exhaustMap((operation) => defer(operation)),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe();
    this.json.valueChanges
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe(() => this.edited());
    this.persistence.autosave(
      () => this.busy() || this.operation() !== 'idle',
      () => this.attempted()
    );
  }
  initialize(draftId?: string): void {
    this.requestedDraftId = draftId ?? this.requestedDraftId;
    draftId = this.requestedDraftId;
    if (this.busy() || this.initializing()) return;
    this.commands.next(() => {
      this.initializing.set(true);
      this.setupErrors.set([]);
      const reads: (() => Observable<unknown>)[] = [
        () => this.track('sections', () => this.store.loadSections()),
        () => this.track('models', () => this.store.loadModels()),
        () => this.track('history', () => this.store.loadHistory()),
        ...(draftId ? [() => this.openSavedDraft(draftId)] : []),
      ];
      return from(reads).pipe(
        concatMap((read) =>
          defer(read).pipe(
            defaultIfEmpty(undefined),
            tap(() => {
              if (this.error())
                this.setupErrors.update((errors) => [
                  ...errors,
                  this.error(),
                ]);
            })
          )
        ),
        tap({
          complete: () => {
            const catalog = this.catalog();
            if (!this.model.value && catalog?.defaultModel)
              this.model.setValue(catalog.defaultModel);
          },
        }),
        finalize(() => this.initializing.set(false))
      );
    });
  }
  loadHistory(): void {
    this.commands.next(() =>
      this.track('history', () => this.store.loadHistory())
    );
  }
  browseImages(): void {
    if (this.attempted()) return;
    this.commands.next(() =>
      this.track('images', () =>
        this.store.loadImages(
          this.imageQuery.value.trim().slice(0, 120)
        )
      )
    );
  }
  selectImage(image: WorkshopImage): void {
    if (!this.busy() && !this.attempted()) this.image.set(image);
  }
  generateImage(): void {
    if (this.busy() || this.attempted() || this.imagePrompt.invalid)
      return;
    this.commands.next(() =>
      this.track('image', () =>
        this.store.generateImage(
          this.imagePrompt.value.trim(),
          'workshop-image.png'
        )
      ).pipe(tap((image) => this.image.set(image)))
    );
  }
  applyImage(): void {
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
    this.commands.next(() =>
      this.track('generate', () => {
        this.previousRepair.set(null);
        return this.startPreparation({
          operation: 'generate',
          input: {
            ...this.form.getRawValue(),
            model: this.model.value,
          } satisfies GenerateWorkshopDraftInput,
        });
      }).pipe(tap((report) => this.acceptPreparation(report)))
    );
  }
  validate(): void {
    if (this.working() || this.attempted()) return;
    let value: unknown;
    try {
      value = JSON.parse(this.json.value);
    } catch {
      this.validation.set('Draft must contain valid JSON.');
      return;
    }
    this.commands.next(() =>
      this.track('validate', () =>
        this.startPreparation({ operation: 'check', draft: value })
      ).pipe(tap((report) => this.acceptPreparation(report)))
    );
  }
  repair(activityId: string): void {
    const report = this.preparation();
    const draft = this.draft();
    const options = this.repairOptions();
    if (
      this.working() ||
      this.attempted() ||
      this.model.invalid ||
      !draft ||
      !report ||
      report.status !== 'complete' ||
      report.ready ||
      !report.draftHash ||
      options?.preparationId !== report.preparationId ||
      options.draftHash !== report.draftHash ||
      !options.activities.some((row) => row.activityId === activityId)
    )
      return;
    const snapshot = { draft, report, options };
    this.commands.next(() => {
      this.previousRepair.set(snapshot);
      this.reviewed.set(false);
      this.step.set(1);
      return this.track('repair', () =>
        this.startPreparation(
          {
            operation: 'repair',
            sourcePreparationId: report.preparationId,
            expectedDraftHash: report.draftHash!,
            activityId,
            model: this.model.value,
          },
          () => {
            this.restoreSnapshot(snapshot);
            this.store.restoreRepairOptions(null);
            this.previousRepair.set(null);
          }
        )
      ).pipe(tap((value) => this.acceptPreparation(value)));
    });
  }
  restorePreviousDraft(): void {
    const snapshot = this.previousRepair();
    if (!snapshot || this.working() || this.attempted()) return;
    this.restoreSnapshot(snapshot);
    this.previousRepair.set(null);
    if (this.savedDraft()) {
      this.json.setValue(JSON.stringify(snapshot.draft, null, 2));
      this.validation.set(
        'Previous draft restored. Validate changes before publishing.'
      );
    }
  }
  private restoreSnapshot(snapshot: {
    draft: WorkshopDraft;
    report: PreparationReport;
    options: PreparationRepairOptions | null;
  }): void {
    this.acceptPreparation(snapshot.report);
    this.store.restoreRepairOptions(snapshot.options);
    this.reviewed.set(false);
    this.step.set(1);
  }
  edited(): void {
    this.unsaved.set(true);
    this.previousRepair.set(null);
    this.preparation.set(null);
    this.reviewed.set(false);
    this.draft.set(null);
    if (!this.attempted() && this.step() > 1) this.step.set(1);
  }
  private startPreparation(
    input: StartWorkshopPreparationInput,
    onRejected?: () => void
  ): Observable<PreparationReport> {
    const preparationId = crypto.randomUUID();
    const now = new Date().toISOString();
    this.preparation.set({
      preparationId,
      status: 'running',
      ready: false,
      createdAt: now,
      updatedAt: now,
      activities: [],
      repairCount: 0,
      message:
        'Starting preparation. If the connection is interrupted, resume with this ID before starting again.',
    });
    const saved = this.savedDraft();
    const draftId = saved?.draftId ?? preparationId;
    const request = {
      ...input,
      preparationId,
      draftId,
      ...(saved ? { draftVersion: saved.version } : {}),
    };
    return (
      onRejected
        ? this.store.prepare(request, onRejected)
        : this.store.prepare(request)
    ).pipe(
      concatMap((report) =>
        this.persistence.confirm(draftId).pipe(
          tap((row) => {
            this.requestedDraftId = row.draftId;
            this.requestId.set(row.draftId);
          }),
          map(() => report)
        )
      ),
      catchError(() => {
        this.saveError.set(
          'Could not confirm the saved draft. Reopen it from Request history before starting another request.'
        );
        return EMPTY;
      })
    );
  }
  private openSavedDraft(id: string): Observable<unknown> {
    this.saveError.set('');
    if (!/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id)) {
      this.saveError.set('Invalid saved draft link.');
      return EMPTY;
    }
    return this.persistence.confirm(id).pipe(
      tap((row) => {
        this.requestId.set(row.publishedRequestId ?? row.draftId);
        this.json.setValue(row.json, { emitEvent: false });
        this.step.set(row.json ? 1 : 0);
        this.reviewed.set(false);
        if (row.brief) {
          this.form.patchValue({
            brief: row.brief.brief,
            sectionId: row.brief.sectionId,
            level: row.brief.level,
          });
          if (row.brief.model) this.model.setValue(row.brief.model);
        }
        try {
          this.draft.set(this.store.parseDraft(JSON.parse(row.json)));
        } catch {
          this.draft.set(null);
        }
        if (!row.preparationId)
          this.validation.set(
            'Saved edits restored. Run Validate changes before publishing.'
          );
      }),
      concatMap((row) =>
        row.previousPreparationId
          ? this.store
              .watchPreparation(row.previousPreparationId)
              .pipe(
                tap((previous) => {
                  if (previous.draft)
                    this.previousRepair.set({
                      draft: previous.draft,
                      report: previous,
                      options: null,
                    });
                }),
                map(() => row)
              )
          : of(row)
      ),
      concatMap((row) =>
        row.publishedRequestId
          ? this.store.receipt(row.publishedRequestId).pipe(
              tap((receipt) => {
                this.receipt.set(receipt);
                this.attempted.set(true);
                this.step.set(2);
              })
            )
          : row.preparationId
            ? this.store
                .watchPreparation(row.preparationId)
                .pipe(tap((report) => this.acceptPreparation(report)))
            : of(row)
      ),
      catchError(() => {
        this.saveError.set(
          'Could not open this draft. Return to Request history and try again.'
        );
        return EMPTY;
      })
    );
  }
  retrySave(): void {
    if (this.working()) return;
    this.commands.next(() =>
      this.unsaved()
        ? this.persistence.save()
        : this.requestedDraftId
          ? this.openSavedDraft(this.requestedDraftId)
          : EMPTY
    );
  }
  resumeChecks(): void {
    const report = this.preparation();
    if (
      !report ||
      report.status !== 'running' ||
      this.working() ||
      this.attempted()
    )
      return;
    this.commands.next(() =>
      this.track(
        this.previousRepair() ? 'repair' : 'validate',
        () => this.store.watchPreparation(report.preparationId),
        true
      ).pipe(tap((value) => this.acceptPreparation(value)))
    );
  }
  private acceptPreparation(report: PreparationReport): void {
    this.preparation.set(report);
    if (report.model) this.model.setValue(report.model);
    if (report.status === 'running') return;
    if (report.draft) this.accept(report.draft);
    this.validation.set(
      report.ready
        ? ''
        : report.message ||
            'Preparation failed. Review the check results and run checks again.'
    );
  }
  private accept(draft: WorkshopDraft): void {
    this.reviewed.set(false);
    this.json.setValue(JSON.stringify(draft, null, 2), {
      emitEvent: false,
    });
    this.draft.set(draft);
    this.validation.set('');
    this.receipt.set(null);
    if (this.step() === 0) this.step.set(1);
  }
  continueToPublish(): void {
    if (
      !this.draft() ||
      !this.checksReady() ||
      this.step() !== 1 ||
      this.working() ||
      this.attempted()
    )
      return;
    this.reviewed.set(true);
    this.step.set(2);
  }
  publish(): void {
    const draft = this.draft();
    if (
      !draft ||
      !this.checksReady() ||
      !this.reviewed() ||
      this.step() !== 2 ||
      this.busy() ||
      this.initializing() ||
      this.attempted()
    )
      return;
    this.commands.next(() => {
      this.attempted.set(true);
      return this.track('publish', () =>
        this.store.publish(
          {
            requestId: this.requestId(),
            draft,
            preparationId: this.preparation()!.preparationId,
          },
          () => {
            this.attempted.set(false);
            this.reviewed.set(false);
            this.preparation.set(null);
            this.draft.set(null);
            this.step.set(1);
          }
        )
      ).pipe(tap((receipt) => this.receipt.set(receipt)));
    });
  }
  inspect(): void {
    if (this.busy()) return;
    const id = this.receiptId.value.trim() || this.requestId();
    if (!/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(id)) {
      this.validation.set('Enter a valid publishing request ID.');
      return;
    }
    this.commands.next(() =>
      this.track('receipt', () => this.store.receipt(id)).pipe(
        tap((receipt) => this.receipt.set(receipt))
      )
    );
  }
  navigate(step: number): void {
    if (this.working() || this.initializing() || this.attempted())
      return;
    if (
      step === 0 ||
      (step === 1 && !!this.json.value) ||
      (step === 2 && this.reviewed() && !!this.draft())
    )
      this.step.set(step);
  }

  private track<T>(
    operation: PublishingOperation,
    request: () => Observable<T>,
    retainPreparation = false
  ): Observable<T> {
    return defer(() => {
      const token = Symbol();
      this.activeOperation = token;
      this.operation.set(operation);
      this.elapsed.set(0);
      if (operation === 'repair') this.validation.set('');
      if (operation === 'generate' || operation === 'validate') {
        this.validation.set('');
        if (!retainPreparation) this.preparation.set(null);
        this.reviewed.set(false);
        this.draft.set(null);
      }
      const started = Date.now();
      const clock = interval(1000).subscribe(() =>
        this.elapsed.set(Math.floor((Date.now() - started) / 1000))
      );
      return defer(request).pipe(
        finalize(() => {
          clock.unsubscribe();
          if (this.activeOperation === token) {
            this.operation.set('idle');
            this.activeOperation = undefined;
          }
        })
      );
    });
  }

  newDraft(): void {
    if (this.busy()) return;
    this.requestedDraftId = undefined;
    this.persistence.reset();
    this.previousRepair.set(null);
    this.preparation.set(null);
    this.step.set(0);
    this.reviewed.set(false);
    this.requestId.set(crypto.randomUUID());
    this.attempted.set(false);
    this.receipt.set(null);
    this.image.set(null);
    this.receiptId.setValue('');
    this.validation.set('');
  }
}
