import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PublishingViewModel } from '../../../../../../src/app/features/workshop-publishing/pages/creation/publishing.view-model';
import { DraftPersistenceViewModel } from '../../../../../../src/app/features/workshop-publishing/pages/creation/draft-persistence.view-model';
import { SavedDraftsStore } from '../../../../../../src/app/features/workshop-publishing/state/saved-drafts.store';
import { SavedWorkshopDraft } from '../../../../../../src/app/features/workshop-publishing/models/publishing.models';

const id = '11111111-1111-4111-8111-111111111111';
const row: SavedWorkshopDraft = {
  draftId: id,
  version: 3,
  name: 'Saved workshop',
  json: '{"name":"Saved workshop",',
  status: 'edited',
  createdAt: '2026-11-07T12:00:00Z',
  updatedAt: '2026-11-07T12:00:00Z',
};
describe('Persistent workshop draft review', () => {
  let http: HttpTestingController;
  let vm: PublishingViewModel;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PublishingViewModel,
        DraftPersistenceViewModel,
      ],
    });
    http = TestBed.inject(HttpTestingController);
    vm = TestBed.inject(PublishingViewModel);
  });
  afterEach(() => http.verify());
  function respond(name: string, data: unknown) {
    const req = http.expectOne('/api/publisher/tools');
    expect(req.request.body.name).toBe(name);
    req.flush({ structuredContent: { data } });
  }
  function open(saved = row) {
    vm.initialize(id);
    respond('manage_document', {
      sections: { angular: { sectionTitle: 'Angular' } },
    });
    respond('list_publishing_models', {
      models: [
        { id: 'test', inputUsdPerMillion: 1, outputUsdPerMillion: 1 },
      ],
      defaultModel: 'test',
      imageModel: 'test',
    });
    respond('list_publishing_runs', []);
    respond('get_workshop_draft', saved);
  }
  it('opens saved incomplete edits by ID without a prior session or model call', () => {
    open();
    expect(vm.json.value).toBe(row.json);
    expect(vm.step()).toBe(1);
    expect(vm.savedDraftId()).toBe(id);
    expect(vm.reviewed()).toBeFalse();
    expect(vm.checksReady()).toBeFalse();
    expect(vm.requestId()).toBe(id);
    expect(vm.unsaved()).toBeFalse();
  });
  it('autosaves source with the current revision, exposes conflicts and retains local edits', () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date());
    try {
      open();
      vm.json.setValue('{"name":"Local edit",');
      expect(vm.unsaved()).toBeTrue();
      jasmine.clock().tick(401);
      const save = http.expectOne('/api/publisher/tools');
      expect(save.request.body).toEqual({
        name: 'save_workshop_draft',
        input: {
          draftId: id,
          version: 3,
          json: '{"name":"Local edit",',
        },
      });
      expect(vm.saving()).toBeTrue();
      save.flush({
        structuredContent: {
          data: { ...row, version: 4, json: '{"name":"Local edit",' },
        },
      });
      expect(vm.unsaved()).toBeFalse();
      expect(vm.savedDraft()?.version).toBe(4);
      vm.json.setValue('newer changes');
      jasmine.clock().tick(401);
      http
        .expectOne('/api/publisher/tools')
        .flush({
          isError: true,
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                error: {
                  code: 'DRAFT_CONFLICT',
                  message: 'Changed in another tab',
                },
              }),
            },
          ],
        });
      expect(vm.json.value).toBe('newer changes');
      expect(vm.unsaved()).toBeTrue();
      expect(vm.saveError()).toContain('Copy your changes');
    } finally {
      jasmine.clock().uninstall();
    }
  });
  it('restores interrupted preparation, keeps publication blocked and does not restart paid work', () => {
    open({ ...row, status: 'interrupted', preparationId: id });
    respond('get_workshop_preparation', {
      preparationId: id,
      status: 'failed',
      ready: false,
      createdAt: '',
      updatedAt: '',
      activities: [],
      repairCount: 0,
      message: 'Processing interrupted. Run checks again.',
    });
    expect(vm.preparation()?.status).toBe('failed');
    expect(vm.checksReady()).toBeFalse();
    expect(vm.reviewed()).toBeFalse();
    expect(vm.validation()).toContain('interrupted');
    vm.publish();
    http.expectNone('/api/publisher/tools');
  });
  it('loads draft summaries with stable IDs and supports the next page cursor', () => {
    const store = TestBed.inject(SavedDraftsStore);
    store.load().subscribe();
    const { json: _json, ...summary } = row;
    respond(
      'list_workshop_drafts',
      Array.from({ length: 50 }, (_, index) => ({
        ...summary,
        draftId:
          index === 49
            ? id
            : `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
      }))
    );
    expect(store.hasMore()).toBeTrue();
    store.load(true).subscribe();
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body.input).toEqual({ before: id });
    request.flush({ structuredContent: { data: [] } });
    expect(store.hasMore()).toBeFalse();
  });
});
