import { PublishingToolError } from '../../../../../src/app/features/workshop-publishing/api/publishing-error';
import { TestBed } from '@angular/core/testing';
import { concatMap, from, of, Subject, throwError } from 'rxjs';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import { PublishingApiService } from '../../../../../src/app/features/workshop-publishing/api/publishing-api.service';
import type {
  WorkshopDraft,
  PublishingReceipt,
  PreparationReport,
} from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('PublishingStore streams', () => {
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
  let store: PublishingStore;
  let api: {
    prepare: jasmine.Spy;
    repairOptions: jasmine.Spy;
    call: jasmine.Spy;
    receipt: jasmine.Spy;
    sections: jasmine.Spy;
    models: jasmine.Spy;
    history: jasmine.Spy;
  };
  beforeEach(() => {
    api = {
      prepare: jasmine.createSpy(),
      repairOptions: jasmine.createSpy(),
      call: jasmine
        .createSpy()
        .and.returnValue(
          throwError(() => new Error('Connection lost'))
        ),
      receipt: jasmine
        .createSpy()
        .and.callFake((value: PublishingReceipt) => value),
      sections: jasmine.createSpy().and.returnValue(of([])),
      models: jasmine
        .createSpy()
        .and.returnValue(
          of({ models: [], defaultModel: null, imageModel: 'image' })
        ),
      history: jasmine.createSpy().and.returnValue(of([])),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: PublishingApiService, useValue: api }],
    });
    store = TestBed.inject(PublishingStore);
  });
  it('allows fresh checks after explicit stale preparation rejection without retaining an uncertain write', () => {
    const id = crypto.randomUUID();
    api.call.and.returnValue(
      throwError(
        () =>
          new PublishingToolError(
            'PREPARATION_STALE',
            'Run checks again'
          )
      )
    );
    const rejected = jasmine.createSpy();
    store
      .publish(
        { requestId: id, draft, preparationId: crypto.randomUUID() },
        rejected
      )
      .subscribe();
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(store.unconfirmedRequests()).not.toContain(id);
    expect(store.error()).toBe('Run checks again');
  });
  it('retains an unconfirmed request after failure and reconciles receipt lookup', () => {
    const requestId = crypto.randomUUID();
    const receipt: PublishingReceipt = {
      requestId,
      subject: 'admin',
      draftHash: 'hash',
      status: 'needs_recovery',
      steps: [],
    };
    store.publish({ requestId, draft }).subscribe();
    expect(store.unconfirmedRequests()).toEqual([requestId]);
    expect(store.history()).toEqual([]);
    expect(store.error()).toContain('Connection lost');
    expect(store.busy()).toBeFalse();
    api.call.and.returnValue(of(receipt));
    store.receipt(requestId).subscribe();
    expect(store.unconfirmedRequests()).toEqual([]);
    expect(store.history()).toEqual([receipt]);
  });
  it('guards on subscription, rejects overlap and releases cancelled operations', () => {
    const pending = new Subject<{ id: string; name: string }[]>();
    api.sections.and.returnValue(pending);
    const read = store.loadSections();
    expect(api.sections).not.toHaveBeenCalled();
    const subscription = read.subscribe();
    store.loadModels().subscribe();
    expect(api.models).not.toHaveBeenCalled();
    expect(store.busy()).toBeTrue();
    subscription.unsubscribe();
    expect(store.busy()).toBeFalse();
    expect(pending.observed).toBeFalse();
    store.loadModels().subscribe();
    expect(api.models).toHaveBeenCalledTimes(1);
  });
  it('supports ordered reads without skipping or unlocking the next pending request', () => {
    const pending = new Subject<PublishingReceipt[]>();
    api.history.and.returnValue(pending);
    from([
      () => store.loadSections(),
      () => store.loadModels(),
      () => store.loadHistory(),
    ])
      .pipe(concatMap((read) => read()))
      .subscribe();
    expect(api.sections).toHaveBeenCalledTimes(1);
    expect(api.models).toHaveBeenCalledTimes(1);
    expect(api.history).toHaveBeenCalledTimes(1);
    expect(store.busy()).toBeTrue();
    pending.next([]);
    pending.complete();
    expect(store.busy()).toBeFalse();
  });
  it('retains IDs when a write is cancelled and does not accept late results', () => {
    const pending = new Subject<PublishingReceipt>();
    api.call.and.returnValue(pending);
    const requestId = crypto.randomUUID();
    const subscription = store
      .publish({ requestId, draft })
      .subscribe();
    subscription.unsubscribe();
    expect(store.unconfirmedRequests()).toEqual([requestId]);
    expect(store.busy()).toBeFalse();
    expect(pending.observed).toBeFalse();
    expect(store.history()).toEqual([]);
  });
  for (const [status, message] of [
    [401, 'Sign in as an administrator'],
    [403, 'Sign in as an administrator'],
    [404, 'not enabled'],
    [500, 'Keep the request ID'],
  ] as const) {
    it(`surfaces HTTP ${status} with actionable guidance`, () => {
      api.sections.and.returnValue(throwError(() => ({ status })));
      store.loadSections().subscribe();
      expect(store.error()).toContain(message);
      expect(store.busy()).toBeFalse();
    });
  }
  it('loads repair eligibility after failed checks without unlocking the operation early', () => {
    const report: PreparationReport = {
      preparationId: crypto.randomUUID(),
      status: 'complete',
      ready: false,
      draft,
      draftHash: 'a'.repeat(64),
      activities: [],
      repairCount: 0,
      createdAt: '',
      updatedAt: '',
    };
    const options = {
      preparationId: report.preparationId,
      draftHash: report.draftHash,
      model: 'test-model',
      activities: [],
    };
    const pending = new Subject<typeof options>();
    api.prepare.and.returnValue(of(report));
    api.repairOptions.and.returnValue(pending);
    const seen: PreparationReport[] = [];
    store
      .prepare({ operation: 'check', draft })
      .subscribe((value) => seen.push(value));
    expect(store.busy()).toBeTrue();
    expect(seen).toEqual([]);
    pending.next(options);
    pending.complete();
    expect(seen).toEqual([report]);
    expect(store.repairOptions()).toEqual(options);
    expect(store.busy()).toBeFalse();
    api.repairOptions.and.returnValue(
      throwError(() => new Error('Older server'))
    );
    store.prepare({ operation: 'check', draft }).subscribe();
    expect(store.repairOptions()).toBeNull();
    expect(store.error()).toBe('');
    expect(store.busy()).toBeFalse();
  });
});
