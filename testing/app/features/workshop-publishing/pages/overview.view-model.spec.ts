import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { EMPTY, of, Subject } from 'rxjs';
import { OverviewViewModel } from '../../../../../src/app/features/workshop-publishing/pages/overview.view-model';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import { PublishingReceipt } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('OverviewViewModel', () => {
  const run: PublishingReceipt = { requestId: crypto.randomUUID(), subject: 'admin', draftHash: 'hash',
    status: 'needs_recovery', message: 'Check Angular resources', steps: [{ name: 'Documents', status: 'complete' }] };
  let vm: OverviewViewModel;
  let store: { history: ReturnType<typeof signal<PublishingReceipt[]>>;
    unconfirmedRequests: ReturnType<typeof signal<string[]>>; busy: ReturnType<typeof signal<boolean>>;
    error: ReturnType<typeof signal<string>>; loadHistory: jasmine.Spy; receipt: jasmine.Spy };
  beforeEach(() => {
    store = { history: signal([run]), unconfirmedRequests: signal([run.requestId, 'unconfirmed-id']),
      busy: signal(false), error: signal(''), loadHistory: jasmine.createSpy().and.returnValue(EMPTY),
      receipt: jasmine.createSpy().and.returnValue(of(run)) };
    TestBed.configureTestingModule({ providers: [OverviewViewModel, { provide: PublishingStore, useValue: store }] });
    vm = TestBed.inject(OverviewViewModel);
  });
  it('combines case-insensitive search with status and includes deduplicated unconfirmed IDs', () => {
    expect(vm.rows().length).toBe(2);
    vm.search.set('  DOCUMENTS  '); vm.status.set('needs_recovery');
    expect(vm.filtered().map(r => r.requestId)).toEqual([run.requestId]);
    vm.status.set('complete'); expect(vm.filtered()).toEqual([]);
    vm.clearFilters(); vm.status.set('unconfirmed');
    expect(vm.filtered().map(r => r.requestId)).toEqual(['unconfirmed-id']);
    vm.search.set('unconfirmed-id'); expect(vm.filtered().length).toBe(1);
  });
  it('inspects receipts without accepting overlapping commands and tears down reads', () => {
    const pending = new Subject<PublishingReceipt[]>();
    store.loadHistory.and.returnValue(pending);
    vm.refresh(); vm.refresh(); vm.inspect(run.requestId);
    expect(store.loadHistory).toHaveBeenCalledTimes(1);
    expect(store.receipt).not.toHaveBeenCalled();
    pending.complete(); vm.inspect(run.requestId);
    expect(vm.receipt()).toEqual(run);
    vm.refresh(); TestBed.resetTestingModule();
    expect(pending.observed).toBeFalse();
  });
});
