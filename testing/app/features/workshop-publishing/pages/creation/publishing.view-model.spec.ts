import { SavedDraftsStore } from '../../../../../../src/app/features/workshop-publishing/state/saved-drafts.store';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PublishingViewModel } from '../../../../../../src/app/features/workshop-publishing/pages/creation/publishing.view-model';
import { DraftPersistenceViewModel } from '../../../../../../src/app/features/workshop-publishing/pages/creation/draft-persistence.view-model';
import { PublishingStore } from '../../../../../../src/app/features/workshop-publishing/state/publishing.store';
import type { WorkshopDraft } from '../../../../../../src/app/features/workshop-publishing/models/publishing.models';
import { EMPTY, map, of, Subject } from 'rxjs';
import type {
  PreparationReport,
  StartWorkshopPreparationInput,
} from '../../../../../../src/app/features/workshop-publishing/models/publishing.models';
const checked = (draft: WorkshopDraft): PreparationReport => ({
  preparationId: '11111111-1111-4111-8111-111111111111',
  status: 'complete',
  ready: true,
  createdAt: '2026-11-05T12:00:00Z',
  updatedAt: '2026-11-05T12:00:00Z',
  activities: [],
  repairCount: 0,
  draft,
});
describe('PublishingViewModel', () => {
  let vm: PublishingViewModel;
  const draft: WorkshopDraft = {
    sectionId: 'angular',
    name: 'Functions',
    summary: 'Learn functions',
    level: 1,
    pages: [],
    labs: [],
    assessment: {
      name: 'Quiz',
      subject: 'angular',
      level: 1,
      testQuestions: [],
    },
  };
  let store: {
    busy: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string>>;
    sections: ReturnType<
      typeof signal<{ id: string; name: string }[]>
    >;
    catalog: ReturnType<
      typeof signal<
        | import('../../../../../../src/app/features/workshop-publishing/models/publishing.models').PublishingModelCatalog
        | null
      >
    >;
    history: ReturnType<
      typeof signal<
        import('../../../../../../src/app/features/workshop-publishing/models/publishing.models').PublishingReceipt[]
      >
    >;
    images: ReturnType<
      typeof signal<
        import('../../../../../../src/app/features/workshop-publishing/models/publishing.models').WorkshopImage[]
      >
    >;
    unconfirmedRequests: ReturnType<typeof signal<string[]>>;
    loadModels: jasmine.Spy;
    loadHistory: jasmine.Spy;
    loadImages: jasmine.Spy;
    generateImage: jasmine.Spy;
    loadSections: jasmine.Spy;
    draft: jasmine.Spy;
    repairOptions: ReturnType<
      typeof signal<
        | import('../../../../../../src/app/features/workshop-publishing/models/publishing.models').PreparationRepairOptions
        | null
      >
    >;
    restoreRepairOptions: jasmine.Spy;
    prepare: jasmine.Spy;
    watchPreparation: jasmine.Spy;
    publish: jasmine.Spy;
    receipt: jasmine.Spy;
  };
  beforeEach(() => {
    store = {
      repairOptions: signal(null),
      restoreRepairOptions: jasmine
        .createSpy()
        .and.callFake((options) => store.repairOptions.set(options)),
      busy: signal(false),
      error: signal(''),
      sections: signal<{ id: string; name: string }[]>([]),
      catalog: signal({
        models: [
          {
            id: 'test-model',
            inputUsdPerMillion: 1,
            outputUsdPerMillion: 2,
          },
        ],
        defaultModel: 'test-model',
        imageModel: 'image-model',
      }),
      history: signal([]),
      images: signal([]),
      unconfirmedRequests: signal([]),
      loadModels: jasmine.createSpy().and.returnValue(of(undefined)),
      loadHistory: jasmine.createSpy().and.returnValue(of(undefined)),
      loadImages: jasmine.createSpy().and.returnValue(of(undefined)),
      generateImage: jasmine.createSpy().and.returnValue(
        of({
          name: 'Illustration',
          storageUrl: 'https://assets.example/image.png',
        })
      ),
      loadSections: jasmine
        .createSpy()
        .and.returnValue(of(undefined)),
      draft: jasmine.createSpy().and.returnValue(of(draft)),
      prepare: jasmine
        .createSpy()
        .and.callFake((input: StartWorkshopPreparationInput) =>
          store
            .draft(
              input.operation === 'generate'
                ? 'generate_workshop_draft'
                : 'validate_workshop_draft',
              input.operation === 'generate'
                ? input.input
                : {
                    draft:
                      input.operation === 'check'
                        ? input.draft
                        : draft,
                  }
            )
            .pipe(map((value: WorkshopDraft) => checked(value)))
        ),
      watchPreparation: jasmine.createSpy().and.returnValue(EMPTY),
      publish: jasmine.createSpy().and.returnValue(EMPTY),
      receipt: jasmine.createSpy().and.returnValue(EMPTY),
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SavedDraftsStore,
          useValue: {
            get: (draftId: string) =>
              of({
                draftId,
                version: 1,
                name: 'Functions',
                json: '',
                status: 'ready',
                createdAt: '',
                updatedAt: '',
              }),
            save: (_row: unknown, json: string) =>
              of({
                draftId: '11111111-1111-4111-8111-111111111111',
                version: 2,
                json,
              }),
          },
        },
        PublishingViewModel,
        DraftPersistenceViewModel,
        { provide: PublishingStore, useValue: store },
      ],
    });
    vm = TestBed.inject(PublishingViewModel);
    vm.model.setValue('test-model');
  });
  it('loads sections, models and receipt history in order on initialization', () => {
    vm.model.setValue('');
    vm.initialize();
    expect(store.loadSections).toHaveBeenCalledTimes(1);
    expect(store.loadModels).toHaveBeenCalledTimes(1);
    expect(store.loadHistory).toHaveBeenCalledTimes(1);
    expect(vm.model.value).toBe('test-model');
    expect(vm.initializing()).toBeFalse();
  });
  it('keeps initialization failures visible even if subsequent reads succeed', () => {
    store.loadSections.and.callFake(() => {
      store.error.set('Section access failed');
      return EMPTY;
    });
    store.loadModels.and.callFake(() => {
      store.error.set('');
      return of(undefined);
    });
    vm.initialize();
    expect(vm.setupErrors()).toEqual(['Section access failed']);
  });
  it('sends the selected model with the generation brief', () => {
    vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    vm.generate();
    expect(store.draft).toHaveBeenCalledWith(
      'generate_workshop_draft',
      {
        brief: 'Teach functions',
        sectionId: 'angular',
        level: 1,
        model: 'test-model',
      }
    );
  });
  it('inspects a historical ID without changing the current publishing ID', () => {
    const current = vm.requestId();
    const historical = crypto.randomUUID();
    vm.inspectHistory(historical);
    expect(store.receipt).toHaveBeenCalledWith(historical);
    expect(vm.requestId()).toBe(current);
  });
  it('adds selected assets as validated editor image blocks and preserves failed edits', () => {
    vm.draft.set({
      ...draft,
      pages: [
        {
          name: 'Intro',
          blocks: [
            {
              blockId: 'p',
              sortIndex: 0,
              componentInstanceName: 'ParagraphBlockComponent',
              savedAction: 'medium',
              dataClean: 'Intro',
            },
          ],
        },
      ],
    });
    vm.selectImage({
      name: 'Illustration',
      storageUrl: 'https://assets.example/image.png',
    });
    store.draft.and.returnValue(EMPTY);
    vm.applyImage();
    const edited = JSON.parse(vm.json.value) as WorkshopDraft;
    expect(
      edited.pages[0].blocks.map((block) => block.sortIndex)
    ).toEqual([0, 1]);
    expect(JSON.parse(edited.pages[0].blocks[0].dataClean).url).toBe(
      'https://assets.example/image.png'
    );
    expect(store.draft).toHaveBeenCalledWith(
      'validate_workshop_draft',
      { draft: edited }
    );
    expect(vm.draft()).toBeNull();
  });
  it('preserves draft and image selection on image generation failure', () => {
    vm.draft.set(draft);
    const image = {
      name: 'Existing',
      storageUrl: 'https://assets.example/existing.png',
    };
    vm.selectImage(image);
    vm.imagePrompt.setValue('An illustration');
    store.generateImage.and.returnValue(EMPTY);
    vm.generateImage();
    expect(vm.image()).toEqual(image);
    expect(vm.draft()).toEqual(draft);
  });
  it('requires a valid brief, validates changes, and clears the reviewed draft on edit', () => {
    vm.generate();
    expect(store.draft).not.toHaveBeenCalled();
    vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    vm.generate();
    expect(vm.draft()).toEqual(draft);
    vm.edited();
    expect(vm.draft()).toBeNull();
    vm.validate();
    expect(vm.draft()).toEqual(draft);
  });
  it('keeps draft and request ID after a failed publish and blocks duplicate attempts', () => {
    vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    vm.generate();
    const id = vm.requestId();
    vm.publish();
    expect(store.publish).not.toHaveBeenCalled();
    vm.continueToPublish();
    vm.publish();
    vm.publish();
    expect(store.publish).toHaveBeenCalledTimes(1);
    expect(vm.requestId()).toBe(id);
    expect(vm.draft()).toEqual(draft);
    vm.inspect();
    expect(store.receipt).toHaveBeenCalledWith(id);
  });
  it('invalidates review for programmatic JSON edits as well as DOM edits', () => {
    vm.draft.set(draft);
    vm.json.setValue('{"changed":true}');
    expect(vm.draft()).toBeNull();
  });
  it('rejects overlapping commands and unsubscribes late results on teardown', () => {
    const pending = new Subject<WorkshopDraft>();
    store.draft.and.returnValue(pending);
    vm.form.setValue({
      brief: 'Functions',
      sectionId: 'angular',
      level: 1,
    });
    vm.generate();
    vm.generate();
    vm.loadHistory();
    expect(store.draft).toHaveBeenCalledTimes(1);
    expect(store.loadHistory).not.toHaveBeenCalled();
    TestBed.resetTestingModule();
    expect(pending.observed).toBeFalse();
    pending.next(draft);
    expect(vm.draft()).toBeNull();
  });
  it('stops ordered initialization when destroyed', () => {
    const pending = new Subject<undefined>();
    store.loadSections.and.returnValue(pending);
    vm.initialize();
    expect(vm.initializing()).toBeTrue();
    TestBed.resetTestingModule();
    expect(vm.initializing()).toBeFalse();
    expect(pending.observed).toBeFalse();
    expect(store.loadModels).not.toHaveBeenCalled();
    expect(store.loadHistory).not.toHaveBeenCalled();
  });
  it('reports invalid JSON and request IDs without issuing server commands', () => {
    vm.json.setValue('{invalid');
    vm.validate();
    expect(vm.validation()).toBe('Draft must contain valid JSON.');
    expect(store.draft).not.toHaveBeenCalled();
    vm.receiptId.setValue('not-a-request-id');
    vm.inspect();
    expect(vm.validation()).toBe(
      'Enter a valid publishing request ID.'
    );
    expect(store.receipt).not.toHaveBeenCalled();
  });
  it('advances only successful drafts and invalidates the publication step on edits', () => {
    vm.form.setValue({
      brief: 'Functions',
      sectionId: 'angular',
      level: 1,
    });
    store.draft.and.returnValue(EMPTY);
    vm.generate();
    expect(vm.step()).toBe(0);
    store.draft.and.returnValue(of(draft));
    vm.generate();
    expect(vm.step()).toBe(1);
    expect(vm.reviewed()).toBeFalse();
    vm.continueToPublish();
    expect(vm.step()).toBe(2);
    expect(vm.reviewed()).toBeTrue();
    vm.json.setValue('{}');
    expect(vm.step()).toBe(1);
    expect(vm.reviewed()).toBeFalse();
    vm.continueToPublish();
    expect(vm.step()).toBe(1);
    vm.newDraft();
    expect(vm.step()).toBe(0);
  });
  it('names ordered setup operations without an earlier finalizer clearing the next stage', () => {
    const sections = new Subject<undefined>();
    const models = new Subject<undefined>();
    store.loadSections.and.returnValue(sections);
    store.loadModels.and.returnValue(models);
    vm.initialize();
    expect(vm.operation()).toBe('sections');
    sections.complete();
    expect(vm.operation()).toBe('models');
    expect(vm.status()).toBe('Loading AI models');
    expect(vm.working()).toBeTrue();
    models.complete();
    expect(vm.operation()).toBe('idle');
    expect(vm.initializing()).toBeFalse();
  });
  it('tracks the actual pending generation and elapsed time, then stops timing on completion', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-11-04T12:00:00Z'));
    try {
      const pending = new Subject<WorkshopDraft>();
      store.draft.and.returnValue(pending);
      vm.form.setValue({
        brief: 'Functions',
        sectionId: 'angular',
        level: 1,
      });
      vm.generate();
      expect(vm.operation()).toBe('generate');
      expect(vm.status()).toBe('Generating workshop draft');
      expect(vm.working()).toBeTrue();
      jasmine.clock().tick(65000);
      expect(vm.elapsed()).toBe(65);
      expect(vm.step()).toBe(0);
      vm.navigate(1);
      expect(vm.step()).toBe(0);
      pending.next(draft);
      pending.complete();
      expect(vm.operation()).toBe('idle');
      expect(vm.step()).toBe(1);
      expect(vm.status()).toBe('Draft ready for review');
      jasmine.clock().tick(5000);
      expect(vm.elapsed()).toBe(65);
    } finally {
      jasmine.clock().uninstall();
    }
  });
  it('keeps the brief recoverable on generation failure and cleans the progress clock on teardown', () => {
    store.draft.and.callFake(() => {
      store.error.set('Model unavailable. Try again.');
      return EMPTY;
    });
    vm.form.setValue({
      brief: 'Keep this topic',
      sectionId: 'angular',
      level: 1,
    });
    vm.generate();
    expect(vm.operation()).toBe('idle');
    expect(vm.status()).toBe('Needs attention');
    expect(vm.form.controls.brief.value).toBe('Keep this topic');
    expect(vm.step()).toBe(0);
    const pending = new Subject<WorkshopDraft>();
    store.draft.and.returnValue(pending);
    vm.generate();
    expect(vm.operation()).toBe('generate');
    TestBed.resetTestingModule();
    expect(pending.observed).toBeFalse();
    expect(vm.operation()).toBe('idle');
  });
  it('guards phase navigation and publication at the view-model boundary', () => {
    vm.navigate(2);
    expect(vm.step()).toBe(0);
    vm.draft.set(draft);
    vm.publish();
    vm.continueToPublish();
    expect(vm.step()).toBe(0);
    expect(store.publish).not.toHaveBeenCalled();
    vm.json.setValue(JSON.stringify(draft), { emitEvent: false });
    vm.preparation.set(checked(draft));
    vm.navigate(1);
    vm.publish();
    expect(store.publish).not.toHaveBeenCalled();
    vm.continueToPublish();
    expect(vm.step()).toBe(2);
    vm.json.setValue('{}');
    expect(vm.reviewed()).toBeFalse();
    vm.navigate(2);
    vm.publish();
    expect(vm.step()).toBe(1);
    expect(store.publish).not.toHaveBeenCalled();
  });
  it('shows failed preparation without granting publication and clears stale evidence on edits', () => {
    const report = {
      ...checked(draft),
      ready: false,
      message: 'Reference failed',
    };
    store.prepare.and.returnValue(of(report));
    vm.json.setValue(JSON.stringify(draft));
    vm.validate();
    expect(vm.preparation()).toEqual(report);
    expect(vm.validation()).toBe('Reference failed');
    expect(vm.draft()).toEqual(draft);
    vm.continueToPublish();
    expect(vm.step()).toBe(1);
    vm.json.setValue('{}');
    expect(vm.preparation()).toBeNull();
    expect(vm.checksReady()).toBeFalse();
  });
  it('retains running activity for resuming polling without restarting generation', () => {
    const report = {
      ...checked(draft),
      status: 'running' as const,
      ready: false,
    };
    store.prepare.and.returnValue(of(report));
    vm.json.setValue(JSON.stringify(draft));
    vm.validate();
    expect(vm.preparation()).toEqual(report);
    expect(vm.draft()).toBeNull();
    store.watchPreparation.and.returnValue(of(checked(draft)));
    vm.resumeChecks();
    expect(store.watchPreparation).toHaveBeenCalledWith(
      report.preparationId
    );
    expect(vm.checksReady()).toBeTrue();
  });
  it('keeps a preparation ID when the start response is lost so progress can be resumed', () => {
    store.prepare.and.returnValue(EMPTY);
    vm.form.setValue({
      brief: 'Functions',
      sectionId: 'angular',
      level: 1,
    });
    vm.generate();
    const report = vm.preparation()!;
    expect(report.preparationId).toMatch(/^[a-f0-9-]{36}$/);
    expect(store.prepare).toHaveBeenCalledWith(
      jasmine.objectContaining({
        preparationId: report.preparationId,
      })
    );
    expect(vm.operation()).toBe('idle');
    vm.resumeChecks();
    expect(store.watchPreparation).toHaveBeenCalledWith(
      report.preparationId
    );
  });
  it('starts a new draft without losing the brief or selected model', () => {
    vm.form.controls.brief.setValue('Keep this brief');
    vm.draft.set(draft);
    vm.attempted.set(true);
    vm.json.setValue('{}');
    vm.validation.set('Previous error');
    const id = vm.requestId();
    vm.newDraft();
    expect(vm.requestId()).not.toBe(id);
    expect(vm.attempted()).toBeFalse();
    expect(vm.draft()).toBeNull();
    expect(vm.receipt()).toBeNull();
    expect(vm.json.value).toBe('');
    expect(vm.validation()).toBe('');
    expect(vm.form.controls.brief.value).toBe('Keep this brief');
    expect(vm.model.value).toBe('test-model');
  });
  function repairableDraft() {
    const report: PreparationReport = {
      ...checked(draft),
      ready: false,
      draftHash: 'a'.repeat(64),
      activities: [
        {
          id: 'coverage',
          label: 'Objective coverage',
          kind: 'check',
          status: 'failed',
          detail: 'Missing mapping',
        },
      ],
    };
    const options = {
      preparationId: report.preparationId,
      draftHash: report.draftHash,
      model: 'test-model',
      activities: [
        { activityId: 'coverage', label: 'Objective coverage' },
      ],
    };
    vm.model.setValue('test-model');
    vm.json.setValue(JSON.stringify(draft), { emitEvent: false });
    vm.draft.set(draft);
    vm.preparation.set(report);
    vm.step.set(1);
    store.repairOptions.set(options);
    return { report, options };
  }
  it('preserves the original while repairing, requires new review and can restore it', () => {
    const { report, options } = repairableDraft();
    const pending = new Subject<PreparationReport>();
    store.prepare.and.returnValue(pending);
    vm.reviewed.set(true);
    vm.validation.set('Original check failed');
    vm.repair('coverage');
    expect(vm.validation()).toBe('');
    expect(vm.operation()).toBe('repair');
    expect(vm.draft()).toEqual(draft);
    expect(vm.reviewed()).toBeFalse();
    vm.repair('coverage');
    vm.restorePreviousDraft();
    expect(store.prepare).toHaveBeenCalledTimes(1);
    expect(store.prepare.calls.mostRecent().args[0]).toEqual(
      jasmine.objectContaining({
        operation: 'repair',
        sourcePreparationId: report.preparationId,
        expectedDraftHash: report.draftHash,
        activityId: 'coverage',
        model: 'test-model',
      })
    );
    const revision = { ...draft, summary: 'Improved explanation' };
    pending.next({
      ...checked(revision),
      preparationId: '22222222-2222-4222-8222-222222222222',
    });
    pending.complete();
    expect(vm.draft()).toEqual(revision);
    expect(vm.repairChanges()).toContain(
      'Updated workshop overview or learning plan'
    );
    expect(vm.step()).toBe(1);
    expect(vm.reviewed()).toBeFalse();
    expect(store.publish).not.toHaveBeenCalled();
    vm.restorePreviousDraft();
    expect(vm.draft()).toBeNull();
    expect(vm.preparation()).toBeNull();
    expect(vm.unsaved()).toBeTrue();
    expect(vm.previousRepair()).toBeNull();
    expect(store.restoreRepairOptions).toHaveBeenCalledWith(options);
  });
  it('does not repair edited or noneligible drafts and preserves an ID for interrupted repairs', () => {
    repairableDraft();
    vm.repair('passed-check');
    expect(store.prepare).not.toHaveBeenCalled();
    store.prepare.and.returnValue(EMPTY);
    vm.repair('coverage');
    const id = vm.preparation()!.preparationId;
    expect(vm.draft()).toEqual(draft);
    expect(vm.previousRepair()).not.toBeNull();
    store.watchPreparation.and.returnValue(
      of({
        ...checked(draft),
        status: 'failed',
        ready: false,
        message: 'Model unavailable',
      })
    );
    vm.resumeChecks();
    expect(store.watchPreparation).toHaveBeenCalledWith(id);
    expect(vm.draft()).toEqual(draft);
    expect(vm.validation()).toBe('Model unavailable');
    vm.restorePreviousDraft();
    vm.json.setValue('{}');
    vm.repair('coverage');
    expect(store.prepare).toHaveBeenCalledTimes(1);
  });
  it('restores the source after an explicit unstarted repair rejection', () => {
    const { report } = repairableDraft();
    store.prepare.and.callFake(
      (_input: unknown, rejected: () => void) => {
        rejected();
        return EMPTY;
      }
    );
    vm.repair('coverage');
    expect(vm.preparation()).toEqual(report);
    expect(vm.draft()).toEqual(draft);
    expect(vm.working()).toBeFalse();
    expect(store.publish).not.toHaveBeenCalled();
    expect(store.repairOptions()).toBeNull();
    vm.repair('coverage');
    expect(store.prepare).toHaveBeenCalledTimes(1);
  });
});
