import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { App } from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';
import { PublishingStore } from '../../src/app/features/workshop-publishing/state/publishing.store';

describe('AI Publisher journey', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('renders publishing controls with automatically loaded section and model dropdowns', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http
      .expectOne('/api/publisher/tools')
      .flush({
        structuredContent: {
          data: {
            sections: { angular: { sectionTitle: 'Angular' } },
          },
        },
      });
    http
      .expectOne('/api/publisher/tools')
      .flush({
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
    http
      .expectOne('/api/publisher/tools')
      .flush({ structuredContent: { data: [] } });
    await fixture.whenStable();
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain(
      'Create and publish workshops.'
    );
    expect(element.textContent).toContain(
      'Work with your Publishing Agent'
    );
    expect(element.textContent).toContain('Check publishing receipt');
    expect(
      element.querySelector('ngx-workshop-publishing')
    ).not.toBeNull();
    expect(element.querySelector('ngx-mcp-console')).toBeNull();
    expect(element.textContent).not.toContain('Connect Ngx Workshop');
    expect(element.querySelectorAll('select').length).toBe(2);
    expect(element.textContent).toContain('Angular');
    expect(element.textContent).toContain(
      '$1.00 input / $2.00 output'
    );
  });

  it('continues ordered setup after a failed read and keeps its guidance visible', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const sections = http.expectOne('/api/publisher/tools');
    expect(sections.request.body.name).toBe('manage_document');
    sections.flush({}, { status: 403, statusText: 'Forbidden' });
    const models = http.expectOne('/api/publisher/tools');
    expect(models.request.body.name).toBe('list_publishing_models');
    models.flush({ structuredContent: { data: {
      models: [], defaultModel: null, imageModel: 'image-model',
    } } });
    const history = http.expectOne('/api/publisher/tools');
    expect(history.request.body.name).toBe('list_publishing_runs');
    history.flush({ structuredContent: { data: [] } });
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Sign in as an administrator');
    expect(element.textContent).toContain('No sections available.');
    expect(TestBed.inject(PublishingStore).busy()).toBeFalse();
  });

  it('cancels initialization HTTP on view disposal and releases shared busy state', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const request = http.expectOne('/api/publisher/tools');
    const store = TestBed.inject(PublishingStore);
    expect(store.busy()).toBeTrue();
    fixture.destroy();
    expect(request.cancelled).toBeTrue();
    expect(store.busy()).toBeFalse();
    http.expectNone('/api/publisher/tools');
  });

  it('keeps the console route and compatibility redirect', () => {
    expect(
      Routes.find((route) => route.path === '')?.redirectTo
    ).toBe('console');
    expect(
      Routes.find((route) => route.path === 'console')?.component
    ).toBe(App);
    expect(
      Routes.find((route) => route.path === 'hello-world')?.redirectTo
    ).toBe('console');
  });
});
