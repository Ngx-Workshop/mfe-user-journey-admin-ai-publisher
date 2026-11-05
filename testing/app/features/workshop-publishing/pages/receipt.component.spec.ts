import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Routes } from '../../../../../src/app/app.routes';
import type { PublishingReceipt } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

const requestId = '11111111-1111-4111-8111-111111111111';

describe('Compact receipt detail', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter(Routes),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('renders result JSON in design-system code blocks and keeps result-free steps simple', async () => {
    const harness = await RouterTestingHarness.create(
      '/requests/' + requestId
    );
    const payload = {
      id: 'document-1',
      text: '<img src=x onerror=alert(1)>',
      nested: { enabled: false, count: 0 },
    };
    const receipt: PublishingReceipt = {
      requestId,
      subject: 'admin',
      draftHash: 'hash',
      status: 'needs_recovery',
      message: 'Inspect the pending step',
      steps: [
        {
          name: 'create_workshop',
          status: 'complete',
          result: payload,
        },
        {
          name: 'create_document_0',
          status: 'complete',
          result: null,
        },
        { name: 'verify_lab_0', status: 'pending' },
      ],
    };
    http
      .expectOne('/api/publisher/tools')
      .flush({ structuredContent: { data: receipt } });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('ngx-code-block').length).toBe(1);
    const code = () =>
      element.querySelector('ngx-code-block code')?.textContent;
    expect(JSON.parse(code()!)).toEqual(payload);
    expect(element.querySelector('ngx-code-block img')).toBeNull();
    expect(
      element.querySelector('ngx-code-block button')?.textContent
    ).toContain('Copy code');
    const steps = element.querySelectorAll<HTMLButtonElement>(
      '.receipt__step-button'
    );
    expect(steps.length).toBe(3);
    expect(steps[0].getAttribute('aria-pressed')).toBe('true');
    steps[1].click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(code()).toBe('null');
    expect(steps[1].getAttribute('aria-pressed')).toBe('true');
    steps[2].click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(element.querySelector('ngx-code-block')).toBeNull();
    expect(
      element.querySelector('.receipt__step-panel')?.textContent
    ).toContain('No result reported for this step.');
    expect(
      element
        .querySelector(
          '[aria-label="Scrollable publishing progress"]'
        )
        ?.getAttribute('tabindex')
    ).toBe('0');
    expect(element.textContent).toContain('Keep this request ID');
  });
  it('clears selected result during a replacement read and starts with the new first step', async () => {
    const harness = await RouterTestingHarness.create(
      '/requests/' + requestId
    );
    const receipt: PublishingReceipt = {
      requestId,
      subject: 'admin',
      draftHash: 'hash',
      status: 'complete',
      steps: [
        {
          name: 'create_workshop',
          status: 'complete',
          result: { value: 'first' },
        },
        {
          name: 'create_document_0',
          status: 'complete',
          result: { value: 'old-selected' },
        },
      ],
    };
    http
      .expectOne('/api/publisher/tools')
      .flush({ structuredContent: { data: receipt } });
    harness.detectChanges();
    await harness.fixture.whenStable();
    harness
      .routeNativeElement!.querySelectorAll<HTMLButtonElement>(
        '.receipt__step-button'
      )[1]
      .click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(
      harness.routeNativeElement!.querySelector('ngx-code-block code')
        ?.textContent
    ).toContain('old-selected');
    const secondId = '22222222-2222-4222-8222-222222222222';
    await harness.navigateByUrl('/requests/' + secondId);
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector('ngx-code-block')
    ).toBeNull();
    http
      .expectOne('/api/publisher/tools')
      .flush({
        structuredContent: {
          data: {
            ...receipt,
            requestId: secondId,
            steps: [
              {
                name: 'create_workshop',
                status: 'complete',
                result: { value: 'new-first' },
              },
            ],
          },
        },
      });
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(
      harness.routeNativeElement!.querySelector('ngx-code-block code')
        ?.textContent
    ).toContain('new-first');
    expect(
      harness
        .routeNativeElement!.querySelector('.receipt__step-button')
        ?.getAttribute('aria-pressed')
    ).toBe('true');
  });
});
