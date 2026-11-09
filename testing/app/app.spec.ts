import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';
import { OverviewComponent } from '../../src/app/features/workshop-publishing/pages/overview/overview.component';
import { PublishingComponent } from '../../src/app/features/workshop-publishing/pages/creation/publishing.component';
import {
  PublishingReceipt,
  WorkshopDraft,
} from '../../src/app/features/workshop-publishing/models/publishing.models';

const run: PublishingReceipt = {
  requestId: '11111111-1111-4111-8111-111111111111',
  subject: 'admin',
  draftHash: 'hash',
  status: 'complete',
  message: 'Angular workshop published',
  steps: [{ name: 'Documents', status: 'complete' }],
};

describe('AI Publisher routed journey', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'ai-publisher', children: Routes }]),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function flushDrafts(): void {
    for (const req of http.match(
      (request) => request.body?.name === 'list_workshop_drafts'
    ))
      req.flush({ structuredContent: { data: [] } });
  }
  function history(rows: PublishingReceipt[] = []): void {
    flushDrafts();
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body.name).toBe('list_publishing_runs');
    request.flush({ structuredContent: { data: rows } });
  }
  function setup(): void {
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          sections: { angular: { sectionTitle: 'Angular' } },
        },
      },
    });
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          models: [
            {
              id: 'test-model',
              inputUsdPerMillion: 1,
              outputUsdPerMillion: 2,
            },
          ],
          defaultModel: 'test-model',
          imageModel: 'image-model',
        },
      },
    });
    history();
  }

  for (const status of ['complete', 'needs_recovery'] as const) {
    it(`opens the actual receipt detail after publishing finishes with ${status}`, async () => {
      const harness = await RouterTestingHarness.create(
        '/ai-publisher/new'
      );
      setup();
      harness.detectChanges();
      await harness.fixture.whenStable();
      const page = harness.routeDebugElement!
        .componentInstance as PublishingComponent;
      const vm = page.vm;
      const draft: WorkshopDraft = {
        sectionId: 'angular',
        name: 'Routing workshop',
        summary: 'Learn routes',
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
      vm.draft.set(draft);
      vm.preparation.set({
        preparationId: '22222222-2222-4222-8222-222222222222',
        status: 'complete',
        ready: true,
        createdAt: '2026-11-08T12:00:00Z',
        updatedAt: '2026-11-08T12:00:00Z',
        activities: [],
        repairCount: 0,
        draft,
      });
      vm.step.set(2);
      vm.reviewed.set(true);
      vm.form.markAsDirty();
      const confirm = spyOn(window, 'confirm');
      const receipt = { ...run, requestId: vm.requestId(), status };
      const router = TestBed.inject(Router);
      vm.receipt.set({ ...receipt, status: 'complete' });
      harness.detectChanges();
      await harness.fixture.whenStable();
      expect(router.url).toBe('/ai-publisher/new'); // Old/inspected receipts are not publish results.
      vm.receipt.set(null);
      vm.publish();
      const publish = http.expectOne('/api/publisher/tools');
      expect(publish.request.body.name).toBe('publish_workshop');
      expect(publish.request.body.input.requestId).toBe(
        receipt.requestId
      );
      expect(router.url).toBe('/ai-publisher/new');
      publish.flush({ structuredContent: { data: receipt } });
      harness.detectChanges();
      await harness.fixture.whenStable();
      expect(router.url).toBe(
        '/ai-publisher/requests/' + receipt.requestId
      );
      expect(confirm).not.toHaveBeenCalled();
      const read = http.expectOne('/api/publisher/tools');
      expect(read.request.body).toEqual({
        name: 'get_publishing_run',
        input: { requestId: receipt.requestId },
      });
      read.flush({ structuredContent: { data: receipt } });
      harness.detectChanges();
      expect(harness.routeNativeElement!.textContent).toContain(
        receipt.requestId
      );
    });
  }
  it('shows a draft in Request history, filters it, and continues the stable review link without a separate panel', async () => {
    const draftId = '22222222-2222-4222-8222-222222222222';
    const saved = {
      draftId,
      version: 2,
      name: 'Unfinished Angular workshop',
      status: 'edited',
      createdAt: '2026-11-07T12:00:00Z',
      updatedAt: '2026-11-07T12:00:00Z',
      json: '{"name":"Unfinished Angular workshop",',
    };
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/overview?status=draft'
    );
    const { json: _json, ...summary } = saved;
    http
      .expectOne('/api/publisher/tools')
      .flush({ structuredContent: { data: [summary] } });
    history([run]);
    harness.detectChanges();
    const element = harness.routeNativeElement!;
    expect(
      element.querySelector('[aria-label="Your drafts"]')
    ).toBeNull();
    const main = element.querySelector('.request-workspace__main')!;
    expect(main.textContent).toContain(saved.name);
    expect(main.textContent).not.toContain(run.requestId);
    main
      .querySelector<HTMLButtonElement>('.request-row__open')!
      .click();
    await harness.fixture.whenStable();
    setup();
    const read = http.expectOne('/api/publisher/tools');
    expect(read.request.body).toEqual({
      name: 'get_workshop_draft',
      input: { draftId },
    });
    read.flush({ structuredContent: { data: saved } });
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe(
      '/ai-publisher/new?draft=' + draftId
    );
    expect(
      harness.routeNativeElement!.querySelector(
        'ngx-publishing-journey'
      )
    ).not.toBeNull();
    harness
      .routeNativeElement!.querySelector<HTMLButtonElement>(
        '[aria-label="Refine the draft"]'
      )!
      .click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    expect(
      document.querySelector<HTMLTextAreaElement>(
        'ngx-publishing-source textarea'
      )?.value
    ).toBe(saved.json);
    TestBed.inject(MatDialog).closeAll();
  });
  it('lands on overview, combines search and filter, and inspects a receipt', async () => {
    const harness =
      await RouterTestingHarness.create('/ai-publisher');
    history([
      run,
      {
        ...run,
        requestId: '22222222-2222-4222-8222-222222222222',
        status: 'running',
        message: 'Generating labs',
      },
    ]);
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/ai-publisher/overview');
    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.textContent).toContain('Request history');
    const search = element.querySelector<HTMLInputElement>('input')!;
    search.value = ' angular ';
    search.dispatchEvent(new Event('input'));
    const filter =
      element.querySelector<HTMLSelectElement>('select')!;
    filter.value = 'running';
    filter.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.textContent).toContain('No matching requests');
    filter.value = 'complete';
    filter.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.querySelectorAll('.history__row').length).toBe(1);
    element
      .querySelector<HTMLButtonElement>(
        '[aria-label="Inspect receipt ' + run.requestId + '"]'
      )!
      .click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toContain(
      '/ai-publisher/requests/' + run.requestId
    );
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body).toEqual({
      name: 'get_publishing_run',
      input: { requestId: run.requestId },
    });
    request.flush({ structuredContent: { data: run } });
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector('.receipt__panel')
        ?.textContent
    ).toContain('Angular workshop published');
    expect(
      harness.routeNativeElement!.querySelector('.overview__receipt')
    ).toBeNull();
    harness
      .routeNativeElement!.querySelector<HTMLButtonElement>(
        'ngx-publishing-actions button'
      )!
      .click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toContain(
      '/ai-publisher/overview'
    );
    history([run]);
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector<HTMLInputElement>(
        'input'
      )!.value
    ).toBe(' angular ');
    expect(
      harness.routeNativeElement!.querySelector<HTMLSelectElement>(
        'select'
      )!.value
    ).toBe('complete');
  });
  it('loads a directly linked receipt and retries failures without loading history', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/requests/' + run.requestId
    );
    const first = http.expectOne('/api/publisher/tools');
    expect(first.request.body.name).toBe('get_publishing_run');
    first.flush({}, { status: 500, statusText: 'Error' });
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector('[role="alert"]')
    ).not.toBeNull();
    Array.from(harness.routeNativeElement!.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Retry'))!
      .click();
    http
      .expectOne('/api/publisher/tools')
      .flush({ structuredContent: { data: run } });
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain(
      'Angular workshop published'
    );
    http.expectNone('/api/publisher/tools');
  });
  it('rejects malformed receipt links without sending HTTP', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/requests/invalid'
    );
    expect(harness.routeNativeElement!.textContent).toContain(
      'Enter a valid publishing request ID.'
    );
    http.expectNone('/api/publisher/tools');
  });
  it('surfaces invalid saved draft links with retry guidance without reading a draft', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/new?draft=invalid'
    );
    setup();
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector('[role="alert"]')
        ?.textContent
    ).toContain('Invalid saved draft link.');
    expect(harness.routeNativeElement!.textContent).toContain(
      'Retry save'
    );
    http.expectNone('/api/publisher/tools');
  });
  it('keeps refinement in the creation session during work and destroys it on departure', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/new'
    );
    setup();
    harness.detectChanges();
    const page = harness.routeDebugElement!
      .componentInstance as PublishingComponent;
    harness
      .routeNativeElement!.querySelector<HTMLButtonElement>(
        '[aria-label="Import workshop draft JSON"]'
      )!
      .click();
    harness.detectChanges();
    await harness.fixture.whenStable();
    const dialog = TestBed.inject(MatDialog).openDialogs[0];
    expect(dialog).toBeDefined();
    page.vm.operation.set('validate');
    harness.detectChanges();
    expect(dialog.disableClose).toBeTrue();
    expect(
      harness.routeNativeElement!.querySelector(
        'ngx-publishing-brief-step'
      )
    ).toBeNull();
    expect(
      document.querySelector('ngx-publishing-refinement')
    ).not.toBeNull();
    expect(
      await TestBed.inject(Router).navigateByUrl(
        '/ai-publisher/overview'
      )
    ).toBeFalse();
    page.vm.operation.set('idle');
    harness.detectChanges();
    expect(dialog.disableClose).toBeFalse();
    const closed = firstValueFrom(dialog.afterClosed());
    await harness.navigateByUrl('/ai-publisher/overview');
    history();
    harness.detectChanges();
    await closed;
    expect(TestBed.inject(MatDialog).openDialogs.length).toBe(0);
  });
  it('renders saved-source conflicts and retries without losing edits or session identity', async () => {
    const id = '22222222-2222-4222-8222-222222222222';
    const saved = {
      draftId: id,
      version: 3,
      name: 'Unfinished workshop',
      status: 'edited',
      createdAt: '2026-11-07T12:00:00Z',
      updatedAt: '2026-11-07T12:00:00Z',
      json: '{"name":"Unfinished workshop",',
    };
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/new?draft=' + id
    );
    setup();
    http
      .expectOne('/api/publisher/tools')
      .flush({ structuredContent: { data: saved } });
    const page = harness.routeDebugElement!
      .componentInstance as PublishingComponent;
    page.vm.json.setValue('local unfinished edits');
    page.vm.retrySave();
    http
      .expectOne('/api/publisher/tools')
      .flush({}, { status: 409, statusText: 'Conflict' });
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector('[role="alert"]')
        ?.textContent
    ).toContain('Copy your changes');
    expect(harness.routeNativeElement!.textContent).toContain(
      'Unsaved changes'
    );
    const retry = [
      ...harness.routeNativeElement!.querySelectorAll('button'),
    ].find((button) => button.textContent?.includes('Retry save'))!;
    retry.click();
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body.input).toEqual({
      draftId: id,
      version: 3,
      json: 'local unfinished edits',
    });
    request.flush({
      structuredContent: {
        data: {
          ...saved,
          version: 4,
          json: 'local unfinished edits',
        },
      },
    });
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain(
      'Draft saved'
    );
    expect(page.vm.json.value).toBe('local unfinished edits');
    expect(page.vm.savedDraftId()).toBe(id);
    expect(page.vm.saveError()).toBe('');
  });
  it('replaces receipt reads on parameter changes without displaying a previous receipt', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/requests/' + run.requestId
    );
    const first = http.expectOne('/api/publisher/tools');
    const secondId = '22222222-2222-4222-8222-222222222222';
    await harness.navigateByUrl('/ai-publisher/requests/' + secondId);
    expect(first.cancelled).toBeTrue();
    const second = http.expectOne('/api/publisher/tools');
    expect(second.request.body.input.requestId).toBe(secondId);
    second.flush({
      structuredContent: { data: { ...run, requestId: secondId } },
    });
    harness.detectChanges();
    expect(
      harness.routeNativeElement!.querySelector('.receipt__id')!
        .textContent
    ).toContain(secondId);
  });
  it('navigates the CTA to a separate wizard within the mount path', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/overview'
    );
    history();
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain(
      'No publishing requests yet'
    );
    harness
      .routeNativeElement!.querySelector<HTMLButtonElement>(
        'ngx-publishing-actions button'
      )!
      .click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/ai-publisher/new');
    setup();
    harness.detectChanges();
    const element = harness.routeNativeElement!;
    expect(element.querySelector('h1')?.textContent).toContain(
      'Start with a clear brief'
    );
    expect(element.textContent).toContain('Start with a clear brief');
    expect(element.textContent).toContain('Draft review');
    expect(element.textContent).toContain('Publication');
    expect(
      element.querySelector('ngx-publishing-history')
    ).toBeNull();
    expect(element.textContent).toContain(
      '$1.00 input / $2.00 output'
    );
    const publish = Array.from(
      element.querySelectorAll('button')
    ).find((b) =>
      b.textContent?.includes('Publish reviewed workshop')
    )!;
    expect(publish).toBeUndefined();
  });
  it('shows history failure and can retry without changing the filters', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/overview'
    );
    flushDrafts();
    http
      .expectOne('/api/publisher/tools')
      .flush({}, { status: 403, statusText: 'Forbidden' });
    harness.detectChanges();
    const element = harness.routeNativeElement!;
    expect(
      element.querySelector('[role="alert"]')?.textContent
    ).toContain('Sign in as an administrator');
    Array.from(element.querySelectorAll('button'))
      .find((b) => b.textContent?.includes('Retry'))!
      .click();
    history([run]);
    harness.detectChanges();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.textContent).toContain(run.requestId);
  });
  it('keeps setup failure guidance and blocks leaving the wizard during initialization', async () => {
    const harness = await RouterTestingHarness.create(
      '/ai-publisher/new'
    );
    expect(
      harness.routeNativeElement!.querySelector<HTMLButtonElement>(
        'ngx-publishing-actions button'
      )!.disabled
    ).toBeTrue();
    expect(
      await TestBed.inject(Router).navigateByUrl(
        '/ai-publisher/overview'
      )
    ).toBeFalse();
    flushDrafts();
    http
      .expectOne('/api/publisher/tools')
      .flush({}, { status: 403, statusText: 'Forbidden' });
    http.expectOne('/api/publisher/tools').flush({
      structuredContent: {
        data: {
          models: [],
          defaultModel: null,
          imageModel: 'image-model',
        },
      },
    });
    history();
    harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain(
      'Sign in as an administrator'
    );
    expect(harness.routeNativeElement!.textContent).toContain(
      'No sections available.'
    );
  });
  it('preserves unsaved draft when leaving is cancelled', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl(
      '/ai-publisher/new',
      PublishingComponent
    );
    setup();
    page.vm.json.setValue('{"draft":"keep"}');
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    expect(
      await TestBed.inject(Router).navigateByUrl(
        '/ai-publisher/overview'
      )
    ).toBeFalse();
    expect(page.vm.json.value).toContain('keep');
    confirm.and.returnValue(true);
    expect(
      await TestBed.inject(Router).navigateByUrl(
        '/ai-publisher/overview'
      )
    ).toBeTrue();
    harness.detectChanges();
    history();
  });
  it('keeps legacy creation URLs and redirects the default to overview', () => {
    expect(Routes.find((r) => r.path === '')?.redirectTo).toBe(
      'overview'
    );
    expect(Routes.find((r) => r.path === 'console')?.redirectTo).toBe(
      'new'
    );
    expect(
      Routes.find((r) => r.path === 'hello-world')?.redirectTo
    ).toBe('overview');
    expect(Routes.find((r) => r.path === 'overview')?.component).toBe(
      OverviewComponent
    );
    expect(Routes.find((r) => r.path === 'new')?.component).toBe(
      PublishingComponent
    );
  });
  it('renders routed content from the exposed App entry', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl(
      '/ai-publisher/overview'
    );
    fixture.detectChanges();
    history();
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('ngx-publishing-overview')
    ).not.toBeNull();
  });
});
