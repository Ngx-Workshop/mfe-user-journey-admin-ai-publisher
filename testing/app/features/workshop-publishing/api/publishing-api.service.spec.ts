import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PublishingApiService } from '../../../../../src/app/features/workshop-publishing/api/publishing-api.service';
import { firstValueFrom } from 'rxjs';
describe('PublishingApiService', () => {
  let api: PublishingApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(PublishingApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('polls reported progress, stops at completion and cancels waiting on unsubscribe', () => {
    jasmine.clock().install();
    try {
      const report = {
        preparationId: '11111111-1111-4111-8111-111111111111',
        status: 'running',
        ready: false,
        createdAt: '2026-11-05T12:00:00Z',
        updatedAt: '2026-11-05T12:00:00Z',
        activities: [],
        repairCount: 0,
      };
      const seen: unknown[] = [];
      let complete = false;
      api.prepare({ operation: 'check', draft: {} }).subscribe({
        next: (value) => seen.push(value),
        complete: () => (complete = true),
      });
      const start = http.expectOne('/api/publisher/tools');
      expect(start.request.body.name).toBe(
        'start_workshop_preparation'
      );
      start.flush({ structuredContent: { data: report } });
      expect(seen.length).toBe(1);
      expect(complete).toBeFalse();
      jasmine.clock().tick(1500);
      const poll = http.expectOne('/api/publisher/tools');
      expect(poll.request.body).toEqual({
        name: 'get_workshop_preparation',
        input: { preparationId: report.preparationId },
      });
      poll.flush({
        structuredContent: {
          data: { ...report, status: 'complete' },
        },
      });
      expect(complete).toBeTrue();
      expect(seen.length).toBe(2);
      jasmine.clock().tick(5000);
      http.expectNone('/api/publisher/tools');
      const sub = api
        .watchPreparation(report.preparationId)
        .subscribe();
      http
        .expectOne('/api/publisher/tools')
        .flush({ structuredContent: { data: report } });
      sub.unsubscribe();
      jasmine.clock().tick(5000);
      http.expectNone('/api/publisher/tools');
    } finally {
      jasmine.clock().uninstall();
    }
  });
  it('rejects malformed preparation activity rather than reporting a fake pass', async () => {
    const promise = firstValueFrom(
      api.watchPreparation('11111111-1111-4111-8111-111111111111')
    );
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: { status: 'complete', ready: true },
      },
    });
    await expectAsync(promise).toBeRejectedWithError(
      'Invalid preparation progress response. Run checks again.'
    );
  });
  it('uses the authenticated admin facade and does not accept MCP errors as success', async () => {
    const result = firstValueFrom(
      api.call('generate_workshop_draft', {
        brief: 'Functions',
        sectionId: 'angular',
        level: 1,
      })
    );
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.body.name).toBe('generate_workshop_draft');
    request.flush({
      isError: true,
      content: [{ type: 'text', text: 'secret upstream details' }],
    });
    await expectAsync(result).toBeRejectedWithError(
      /could not complete/
    );
  });
  it('shows actionable generation errors without upstream text', async () => {
    const result = firstValueFrom(
      api.call('generate_workshop_draft', {})
    );
    http.expectOne('/api/publisher/tools').flush({
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: {
              code: 'MODEL_TIMEOUT',
              message: 'secret provider details',
            },
          }),
        },
      ],
    });
    await expectAsync(result).toBeRejectedWithError(
      'The AI model timed out while generating the draft. Try a narrower workshop brief.'
    );
  });
  for (const content of [
    [],
    [{ type: 'text', text: 'malformed' }],
    [
      {
        type: 'text',
        text: '{"error":{"code":"UNKNOWN","message":"secret"}}',
      },
    ],
    [{ type: 'text', text: '{"error":{"code":"toString"}}' }],
  ]) {
    it('falls back safely for unrecognized error content', async () => {
      const result = firstValueFrom(
        api.call('generate_workshop_draft', {})
      );
      http
        .expectOne('/api/publisher/tools')
        .flush({ isError: true, content });
      await expectAsync(result).toBeRejectedWithError(
        /could not complete/
      );
    });
  }
  it('rejects malformed drafts and receipts', () => {
    expect(() =>
      api.draft({ name: 'missing resources' })
    ).toThrowError(/workshop format/);
    expect(() =>
      api.receipt({
        requestId: 'id',
        status: 'complete',
        steps: [{}],
      })
    ).toThrowError(/receipt/);
  });
  it('returns structured data from successful responses', async () => {
    const result = firstValueFrom(
      api.call('get_publishing_run', {
        requestId: 'id',
      })
    );
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: { data: { status: 'needs_recovery' } },
    });
    expect(await result).toEqual({ status: 'needs_recovery' });
  });
  it('is cold and cancels HTTP when the subscriber leaves', () => {
    const result = api.call('list_publishing_runs', {});
    http.expectNone('/api/publisher/tools');
    const subscription = result.subscribe();
    const request = http.expectOne('/api/publisher/tools');
    subscription.unsubscribe();
    expect(request.cancelled).toBeTrue();
  });
  it('validates eligible repair options and rejects a foreign preparation response', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const options = {
      preparationId: id,
      draftHash: 'a'.repeat(64),
      model: 'test-model',
      activities: [
        { activityId: 'coverage', label: 'Objective coverage' },
      ],
    };
    const result = firstValueFrom(api.repairOptions(id));
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body).toEqual({
      name: 'get_workshop_repair_options',
      input: { preparationId: id },
    });
    request.flush({ structuredContent: { data: options } });
    expect(await result).toEqual(options);
    const invalid = firstValueFrom(api.repairOptions(id));
    http
      .expectOne('/api/publisher/tools')
      .flush({
        structuredContent: {
          data: {
            ...options,
            preparationId: '22222222-2222-4222-8222-222222222222',
          },
        },
      });
    await expectAsync(invalid).toBeRejectedWithError(
      'Repair options no longer match this preparation. Run checks again.'
    );
  });
});
