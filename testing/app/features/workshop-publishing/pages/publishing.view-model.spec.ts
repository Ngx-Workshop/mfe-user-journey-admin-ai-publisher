import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PublishingViewModel } from '../../../../../src/app/features/workshop-publishing/pages/publishing.view-model';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import type { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';
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
      loadModels: jasmine.createSpy().and.resolveTo(),
      loadHistory: jasmine.createSpy().and.resolveTo(),
      loadImages: jasmine.createSpy().and.resolveTo(),
      generateImage: jasmine
        .createSpy()
        .and.resolveTo({
          name: 'Illustration',
          storageUrl: 'https://assets.example/image.png',
        }),
      loadSections: jasmine.createSpy().and.resolveTo(),
      draft: jasmine.createSpy().and.resolveTo(draft),
      publish: jasmine.createSpy().and.resolveTo(undefined),
      receipt: jasmine.createSpy().and.resolveTo(undefined),
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
  it('loads sections, models and receipt history in order on initialization', async () => {
    vm.model.setValue('');
    await vm.initialize();
    expect(store.loadSections).toHaveBeenCalledTimes(1);
    expect(store.loadModels).toHaveBeenCalledTimes(1);
    expect(store.loadHistory).toHaveBeenCalledTimes(1);
    expect(vm.model.value).toBe('test-model');
    expect(vm.initializing()).toBeFalse();
  });
  it('keeps initialization failures visible even if subsequent reads succeed', async () => {
    store.loadSections.and.callFake(async () => {
      store.error.set('Section access failed');
    });
    store.loadModels.and.callFake(async () => {
      store.error.set('');
    });
    await vm.initialize();
    expect(vm.setupErrors()).toEqual(['Section access failed']);
  });
  it('sends the selected model with the generation brief', async () => {
    vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    await vm.generate();
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
  it('inspects a historical ID without changing the current publishing ID', async () => {
    const current = vm.requestId();
    const historical = crypto.randomUUID();
    await vm.inspectHistory(historical);
    expect(store.receipt).toHaveBeenCalledWith(historical);
    expect(vm.requestId()).toBe(current);
  });
  it('adds selected assets as validated editor image blocks and preserves failed edits', async () => {
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
    store.draft.and.resolveTo(undefined);
    await vm.applyImage();
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
  it('preserves draft and image selection on image generation failure', async () => {
    vm.draft.set(draft);
    const image = {
      name: 'Existing',
      storageUrl: 'https://assets.example/existing.png',
    };
    vm.selectImage(image);
    vm.imagePrompt.setValue('An illustration');
    store.generateImage.and.resolveTo(undefined);
    await vm.generateImage();
    expect(vm.image()).toEqual(image);
    expect(vm.draft()).toEqual(draft);
  });
  it('requires a valid brief, validates changes, and clears the reviewed draft on edit', async () => {
    await vm.generate();
    expect(store.draft).not.toHaveBeenCalled();
    vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    await vm.generate();
    expect(vm.draft()).toEqual(draft);
    vm.edited();
    expect(vm.draft()).toBeNull();
    await vm.validate();
    expect(vm.draft()).toEqual(draft);
  });
  it('keeps draft and request ID after a failed publish and blocks duplicate attempts', async () => {
    vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    await vm.generate();
    const id = vm.requestId();
    await vm.publish();
    await vm.publish();
    expect(store.publish).toHaveBeenCalledTimes(1);
    expect(vm.requestId()).toBe(id);
    expect(vm.draft()).toEqual(draft);
    await vm.inspect();
    expect(store.receipt).toHaveBeenCalledWith(id);
  });
});
