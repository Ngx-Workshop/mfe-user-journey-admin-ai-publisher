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
  it('shows failed verification separately from completion and links the matching editor without publishing', async () => {
    const harness = await RouterTestingHarness.create(
      '/requests/' + requestId
    );
    const steps: PublishingReceipt['steps'] = [
      {
        name: 'create_lab_0',
        status: 'complete',
        result: { _id: '6aebffc0140f132cb6017a19' },
      },
      {
        name: 'verify_lab_0',
        status: 'complete',
        result: {
          passed: false,
          totalTests: 6,
          passedTests: 0,
          results: [],
        },
      },
    ];
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          requestId,
          subject: 'admin',
          draftHash: 'hash',
          status: 'needs_recovery',
          steps,
        },
      },
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const element = harness.routeNativeElement!;
    expect(element.textContent).toContain('Needs attention');
    expect(element.textContent).toContain(
      '2 of 2 publishing steps complete'
    );
    expect(element.textContent).toContain(
      '1 coding lab failed verification'
    );
    const verification = element.querySelectorAll<HTMLButtonElement>(
      '.receipt__step-button'
    )[1];
    expect(verification.textContent).toContain('Completed');
    expect(verification.textContent).toContain('Verification failed');
    verification.click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    const result = element.querySelector('.receipt__step-panel')!;
    expect(result.textContent).toContain('0 of 6 tests passed');
    expect(result.textContent).toContain(
      'The verification operation completed'
    );
    const link = result.querySelector<HTMLAnchorElement>('a')!;
    expect(link.getAttribute('href')).toBe(
      '/coding-labs-editor/coding-labs/6aebffc0140f132cb6017a19'
    );
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    expect(link.rel).toContain('noreferrer');
    expect(
      result.querySelector<HTMLElement>('.receipt-panel__body')!.style
        .height
    ).toBe('');
    http.expectNone(
      (request) => request.body?.name === 'publish_workshop'
    );
  });
  it('links completed documentation steps to the exact page and suppresses pending documentation links', async () => {
    const harness = await RouterTestingHarness.create(
      '/requests/' + requestId
    );
    const workshopId = '6acb08014d4ddb09fe850005';
    const pageId = '6acb08014d4ddb09fe850006';
    const secondId = '6acb08014d4ddb09fe850007';
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          requestId,
          subject: 'admin',
          draftHash: 'hash',
          status: 'needs_recovery',
          steps: [
            {
              name: 'create_workshop',
              status: 'complete',
              result: {
                _id: workshopId,
                sectionId: 'angular',
                workshopDocumentGroupId: 'what-is-angular',
              },
            },
            {
              name: 'write_page_0',
              status: 'complete',
              result: {
                _id: pageId,
                workshopGroupId: workshopId,
                pageType: 'PAGE',
              },
            },
            {
              name: 'create_page_1',
              status: 'complete',
              result: {
                _id: workshopId,
                workshopDocuments: [
                  { _id: pageId, kind: 'PAGE', sortId: 0 },
                  { _id: secondId, kind: 'PAGE', sortId: 1 },
                ],
              },
            },
            { name: 'name_page_1', status: 'pending' },
          ],
        },
      },
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const element = harness.routeNativeElement!;
    const steps = element.querySelectorAll<HTMLButtonElement>(
      '.receipt__step-button'
    );
    for (const index of [1, 2]) {
      steps[index].click();
      harness.detectChanges();
      await harness.fixture.whenStable();
      const link = element.querySelector<HTMLAnchorElement>(
        '.receipt__step-panel a'
      )!;
      expect(link.textContent).toContain('Open documentation editor');
      expect(link.getAttribute('href')).toBe(
        '/document-editor/angular/what-is-angular/' +
          (index === 1 ? pageId : secondId)
      );
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
      expect(link.hasAttribute('mat-button')).toBeFalse();
    }
    steps[3].click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(
      element.querySelector('.receipt__step-panel a')
    ).toBeNull();
  });
  it('hides the editor CTA on a pending verification despite a completed matching lab creation', async () => {
    const harness = await RouterTestingHarness.create(
      '/requests/' + requestId
    );
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          requestId,
          subject: 'admin',
          draftHash: 'hash',
          status: 'needs_recovery',
          steps: [
            {
              name: 'create_lab_0',
              status: 'complete',
              result: { _id: '6aebffc0140f132cb6017a19' },
            },
            { name: 'verify_lab_0', status: 'pending' },
          ],
        },
      },
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const element = harness.routeNativeElement!;
    expect(
      element.querySelector('.receipt__step-panel a')
    ).not.toBeNull();
    element
      .querySelectorAll<HTMLButtonElement>('.receipt__step-button')[1]
      .click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    const panel = element.querySelector('.receipt__step-panel')!;
    expect(panel.textContent).toContain('Pending');
    expect(panel.textContent).toContain('No result reported');
    expect(panel.querySelector('a')).toBeNull();
  });
  it('shows successful verification and gives guidance when no matching editor identity is available', async () => {
    const harness = await RouterTestingHarness.create(
      '/requests/' + requestId
    );
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          requestId,
          subject: 'admin',
          draftHash: 'hash',
          status: 'complete',
          steps: [
            {
              name: 'verify_lab_2',
              status: 'complete',
              result: { passed: true, totalTests: 3, passedTests: 3 },
            },
          ],
        },
      },
    });
    harness.detectChanges();
    await harness.fixture.whenStable();
    const element = harness.routeNativeElement!;
    const result = element.querySelector('.receipt__step-panel')!;
    expect(result.textContent).toContain('Verification passed');
    expect(result.textContent).toContain('3 of 3 tests passed');
    expect(result.textContent).toContain(
      'does not include a usable coding lab ID'
    );
    expect(result.querySelector('a')).toBeNull();
    expect(element.textContent).not.toContain(
      'coding lab failed verification'
    );
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
    http.expectOne('/api/publisher/tools').flush({
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
