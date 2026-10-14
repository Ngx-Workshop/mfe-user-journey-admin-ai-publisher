import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';
import { OverviewComponent } from '../../src/app/features/workshop-publishing/pages/overview.component';
import { PublishingComponent } from '../../src/app/features/workshop-publishing/pages/publishing.component';
import { PublishingReceipt } from '../../src/app/features/workshop-publishing/models/publishing.models';

const run: PublishingReceipt = {
  requestId: '11111111-1111-4111-8111-111111111111', subject: 'admin', draftHash: 'hash',
  status: 'complete', message: 'Angular workshop published', steps: [{ name: 'Documents', status: 'complete' }],
};

describe('AI Publisher routed journey', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(),
      provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: 'ai-publisher', children: Routes }])],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  function history(rows: PublishingReceipt[] = []): void {
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body.name).toBe('list_publishing_runs');
    request.flush({ structuredContent: { data: rows } });
  }
  function setup(): void {
    http.expectOne('/api/publisher/tools').flush({ structuredContent: { data: {
      sections: { angular: { sectionTitle: 'Angular' } },
    } } });
    http.expectOne('/api/publisher/tools').flush({ structuredContent: { data: {
      models: [{ id: 'test-model', inputUsdPerMillion: 1, outputUsdPerMillion: 2 }],
      defaultModel: 'test-model', imageModel: 'image-model',
    } } });
    history();
  }
  it('lands on overview, combines search and filter, and inspects a receipt', async () => {
    const harness = await RouterTestingHarness.create('/ai-publisher');
    history([run, { ...run, requestId: '22222222-2222-4222-8222-222222222222', status: 'running', message: 'Generating labs' }]);
    harness.detectChanges();
    expect(TestBed.inject(Router).url).toBe('/ai-publisher/overview');
    const element = harness.routeNativeElement!;
    expect(element.querySelectorAll('h1').length).toBe(1);
    expect(element.textContent).toContain('Request history');
    const search = element.querySelector<HTMLInputElement>('input')!;
    search.value = ' angular ';
    search.dispatchEvent(new Event('input'));
    const filter = element.querySelector<HTMLSelectElement>('select')!;
    filter.value = 'running'; filter.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.textContent).toContain('No matching requests');
    filter.value = 'complete'; filter.dispatchEvent(new Event('change'));
    harness.detectChanges();
    expect(element.querySelectorAll('.history__row').length).toBe(1);
    element.querySelector<HTMLButtonElement>('[aria-label="Inspect receipt ' + run.requestId + '"]')!.click();
    const request = http.expectOne('/api/publisher/tools');
    expect(request.request.body).toEqual({ name: 'get_publishing_run', input: { requestId: run.requestId } });
    request.flush({ structuredContent: { data: run } });
    harness.detectChanges();
    expect(element.querySelector('.overview__receipt')?.textContent).toContain('Angular workshop published');
  });
  it('navigates the CTA to a separate wizard within the mount path', async () => {
    const harness = await RouterTestingHarness.create('/ai-publisher/overview');
    history(); harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('No publishing requests yet');
    harness.routeNativeElement!.querySelector<HTMLButtonElement>('ngx-publishing-actions button')!.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/ai-publisher/new');
    setup(); harness.detectChanges();
    const element = harness.routeNativeElement!;
    expect(element.querySelector('h1')?.textContent).toContain('New workshop');
    expect(element.textContent).toContain('Describe your workshop');
    expect(element.textContent).toContain('Review and refine');
    expect(element.textContent).toContain('Publish and confirm');
    expect(element.querySelector('ngx-publishing-history')).toBeNull();
    expect(element.textContent).toContain('$1.00 input / $2.00 output');
    const publish = Array.from(element.querySelectorAll('button')).find(b => b.textContent?.includes('Publish reviewed workshop'))!;
    expect(publish.disabled).toBeTrue();
  });
  it('shows history failure and can retry without changing the filters', async () => {
    const harness = await RouterTestingHarness.create('/ai-publisher/overview');
    http.expectOne('/api/publisher/tools').flush({}, { status: 403, statusText: 'Forbidden' });
    harness.detectChanges();
    const element = harness.routeNativeElement!;
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Sign in as an administrator');
    Array.from(element.querySelectorAll('button')).find(b => b.textContent?.includes('Retry'))!.click();
    history([run]); harness.detectChanges();
    expect(element.querySelector('[role="alert"]')).toBeNull();
    expect(element.textContent).toContain(run.requestId);
  });
  it('keeps setup failure guidance and blocks leaving the wizard during initialization', async () => {
    const harness = await RouterTestingHarness.create('/ai-publisher/new');
    expect(harness.routeNativeElement!.querySelector<HTMLButtonElement>('ngx-publishing-actions button')!.disabled).toBeTrue();
    expect(await TestBed.inject(Router).navigateByUrl('/ai-publisher/overview')).toBeFalse();
    http.expectOne('/api/publisher/tools').flush({}, { status: 403, statusText: 'Forbidden' });
    http.expectOne('/api/publisher/tools').flush({ structuredContent: { data: { models: [], defaultModel: null, imageModel: 'image-model' } } });
    history(); harness.detectChanges();
    expect(harness.routeNativeElement!.textContent).toContain('Sign in as an administrator');
    expect(harness.routeNativeElement!.textContent).toContain('No sections available.');
  });
  it('preserves unsaved draft when leaving is cancelled', async () => {
    const harness = await RouterTestingHarness.create();
    const page = await harness.navigateByUrl('/ai-publisher/new', PublishingComponent);
    setup();
    page.vm.json.setValue('{"draft":"keep"}');
    const confirm = spyOn(window, 'confirm').and.returnValue(false);
    expect(await TestBed.inject(Router).navigateByUrl('/ai-publisher/overview')).toBeFalse();
    expect(page.vm.json.value).toContain('keep');
    confirm.and.returnValue(true);
    expect(await TestBed.inject(Router).navigateByUrl('/ai-publisher/overview')).toBeTrue();
    harness.detectChanges();
    history();
  });
  it('keeps legacy creation URLs and redirects the default to overview', () => {
    expect(Routes.find(r => r.path === '')?.redirectTo).toBe('overview');
    expect(Routes.find(r => r.path === 'console')?.redirectTo).toBe('new');
    expect(Routes.find(r => r.path === 'hello-world')?.redirectTo).toBe('overview');
    expect(Routes.find(r => r.path === 'overview')?.component).toBe(OverviewComponent);
    expect(Routes.find(r => r.path === 'new')?.component).toBe(PublishingComponent);
  });
  it('renders routed content from the exposed App entry', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/ai-publisher/overview');
    fixture.detectChanges();
    history(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('ngx-publishing-overview')).not.toBeNull();
  });
});
