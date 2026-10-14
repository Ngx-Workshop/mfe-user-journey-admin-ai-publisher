import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PublishingViewModel } from '../../../../../src/app/features/workshop-publishing/pages/publishing.view-model';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import type { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';
import { EMPTY, of, Subject } from 'rxjs';
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
        | import('../../../../../src/app/features/workshop-publishing/models/publishing.models').PublishingModelCatalog
        | null
      >
    >;
    history: ReturnType<
      typeof signal<
        import('../../../../../src/app/features/workshop-publishing/models/publishing.models').PublishingReceipt[]
      >
    >;
    images: ReturnType<
      typeof signal<
        import('../../../../../src/app/features/workshop-publishing/models/publishing.models').WorkshopImage[]
      >
    >;
    unconfirmedRequests: ReturnType<typeof signal<string[]>>;
    loadModels: jasmine.Spy;
    loadHistory: jasmine.Spy;
    loadImages: jasmine.Spy;
    generateImage: jasmine.Spy;
    loadSections: jasmine.Spy;
    draft: jasmine.Spy;
    publish: jasmine.Spy;
    receipt: jasmine.Spy;
  };
  beforeEach(() => {
    store = {
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
      generateImage: jasmine
        .createSpy()
        .and.returnValue(of({
          name: 'Illustration',
          storageUrl: 'https://assets.example/image.png',
        })),
      loadSections: jasmine.createSpy().and.returnValue(of(undefined)),
      draft: jasmine.createSpy().and.returnValue(of(draft)),
      publish: jasmine.createSpy().and.returnValue(EMPTY),
      receipt: jasmine.createSpy().and.returnValue(EMPTY),
    };
    TestBed.configureTestingModule({
      providers: [
        PublishingViewModel,
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
    vm.form.setValue({ brief: 'Functions', sectionId: 'angular', level: 1 });
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
    expect(vm.validation()).toBe('Enter a valid publishing request ID.');
    expect(store.receipt).not.toHaveBeenCalled();
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
});
