import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PublishingApiService } from '../../../../../src/app/features/workshop-publishing/api/publishing-api.service';
describe('PublishingApiService', () => {
  let api: PublishingApiService; let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(PublishingApiService); http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses the authenticated admin facade and does not accept MCP errors as success', async () => {
    const result = api.call('generate_workshop_draft', { brief: 'Functions', sectionId: 'angular', level: 1 });
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body.name).toBe('generate_workshop_draft');
    request.flush({ isError: true, content: [{ type: 'text', text: 'secret upstream details' }] });
    await expectAsync(result).toBeRejectedWithError(/could not complete/);
  });
  it('rejects malformed drafts and receipts', () => {
    expect(() => api.draft({name: 'missing resources'})).toThrowError(/workshop format/);
    expect(() => api.receipt({requestId: 'id', status: 'complete', steps: [{}]})).toThrowError(/receipt/);
  });
  it('returns structured data from successful responses', async () => {
    const result = api.call('get_publishing_run', { requestId: 'id' });
    http.expectOne('/api/publisher/tools').flush({ structuredContent: { data: { status: 'needs_recovery' } } });
    expect(await result).toEqual({ status: 'needs_recovery' });
  });
});
