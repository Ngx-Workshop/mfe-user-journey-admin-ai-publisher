import { SavedDraftsStore } from '../../../../../../src/app/features/workshop-publishing/state/saved-drafts.store';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { OverviewViewModel } from '../../../../../../src/app/features/workshop-publishing/pages/overview/overview.view-model';
import { PublishingStore } from '../../../../../../src/app/features/workshop-publishing/state/publishing.store';
import { PublishingReceipt } from '../../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('OverviewViewModel', () => {
  const run: PublishingReceipt = {
    requestId: crypto.randomUUID(),
    subject: 'admin',
    draftHash: 'hash',
    status: 'needs_recovery',
    message: 'Check Angular resources',
    steps: [{ name: 'Documents', status: 'complete' }],
  };
  let vm: OverviewViewModel;
  let store: {
    history: ReturnType<typeof signal<PublishingReceipt[]>>;
    unconfirmedRequests: ReturnType<typeof signal<string[]>>;
    busy: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string>>;
    loadHistory: jasmine.Spy;
  };
  beforeEach(() => {
    store = {
      history: signal([run]),
      unconfirmedRequests: signal([run.requestId, 'unconfirmed-id']),
      busy: signal(false),
      error: signal(''),
      loadHistory: jasmine.createSpy().and.returnValue(EMPTY),
    };
    TestBed.configureTestingModule({
      providers: [
        OverviewViewModel,
        { provide: PublishingStore, useValue: store },
      ],
    });
    vm = TestBed.inject(OverviewViewModel);
  });
  it('searches and filters drafts while suppressing duplicate receipt and unconfirmed rows', () => {
    const drafts = TestBed.inject(SavedDraftsStore);
    const summary = {
      draftId: '22222222-2222-4222-8222-222222222222',
      version: 1,
      name: 'Unfinished RxJS',
      status: 'ready' as const,
      createdAt: '',
      updatedAt: '2026-11-07T12:00:00Z',
    };
    drafts.rows.set([
      summary,
      { ...summary, draftId: run.requestId },
      { ...summary, draftId: 'unconfirmed-id' },
    ]);
    expect(vm.rows().length).toBe(3);
    vm.status.set('draft');
    vm.search.set('rxjs');
    expect(vm.filtered().map((row) => row.draftId)).toEqual([
      summary.draftId,
    ]);
    drafts.error.set('Draft list failed');
    expect(vm.error()).toContain('Draft list failed');
    drafts.busy.set(true);
    expect(vm.busy()).toBeTrue();
  });
  it('combines case-insensitive search with status and includes deduplicated unconfirmed IDs', () => {
    expect(vm.rows().length).toBe(2);
    vm.search.set('  DOCUMENTS  ');
    vm.status.set('needs_recovery');
    expect(vm.filtered().map((r) => r.requestId)).toEqual([
      run.requestId,
    ]);
    vm.status.set('complete');
    expect(vm.filtered()).toEqual([]);
    vm.clearFilters();
    vm.status.set('unconfirmed');
    expect(vm.filtered().map((r) => r.requestId)).toEqual([
      'unconfirmed-id',
    ]);
    vm.search.set('unconfirmed-id');
    expect(vm.filtered().length).toBe(1);
  });
  it('rejects overlapping refreshes and tears down reads', () => {
    const pending = new Subject<PublishingReceipt[]>();
    store.loadHistory.and.returnValue(pending);
    vm.refresh();
    vm.refresh();
    expect(store.loadHistory).toHaveBeenCalledTimes(1);
    TestBed.resetTestingModule();
    expect(pending.observed).toBeFalse();
  });
  it('includes completed first-step workshop names in local search', () => {
    store.history.set([
      {
        ...run,
        steps: [
          {
            name: 'create_workshop',
            status: 'complete',
            result: {
              name: 'Pure TypeScript Functions',
              sectionId: 'angular',
              workshopDocumentGroupId: 'pure-functions',
            },
          },
        ],
      },
    ]);
    vm.search.set('  PURE TYPESCRIPT  ');
    expect(vm.filtered().map((row) => row.requestId)).toEqual([
      run.requestId,
    ]);
    expect(vm.filtered()[0].workshopUrl).toBe(
      '/document-editor/angular/pure-functions'
    );
  });
});
