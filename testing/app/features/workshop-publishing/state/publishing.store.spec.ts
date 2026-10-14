import { TestBed } from '@angular/core/testing';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import { PublishingApiService } from '../../../../../src/app/features/workshop-publishing/api/publishing-api.service';
import type {
  WorkshopDraft,
  PublishingReceipt,
} from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('PublishingStore request history', () => {
  it('retains an unconfirmed request after failure and reconciles it on receipt lookup', async () => {
    const requestId = crypto.randomUUID();
    const receipt: PublishingReceipt = {
      requestId,
      subject: 'admin',
      draftHash: 'hash',
      status: 'needs_recovery',
      steps: [],
    };
    const api = {
      call: jasmine
        .createSpy()
        .and.rejectWith(new Error('Connection lost')),
      receipt: jasmine.createSpy().and.returnValue(receipt),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: PublishingApiService, useValue: api }],
    });
    const store = TestBed.inject(PublishingStore);
    await store.publish({ requestId, draft: {} as WorkshopDraft });
    expect(store.unconfirmedRequests()).toEqual([requestId]);
    expect(store.history()).toEqual([]);
    expect(store.error()).toContain('Connection lost');
    api.call.and.resolveTo(receipt);
    await store.receipt(requestId);
    expect(store.unconfirmedRequests()).toEqual([]);
    expect(store.history()).toEqual([receipt]);
  });
});
