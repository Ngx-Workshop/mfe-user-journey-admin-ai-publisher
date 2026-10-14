import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { App } from '../../src/app/app';
import { Routes } from '../../src/app/app.routes';

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
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
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
    await new Promise<void>((resolve) => setTimeout(resolve, 0));
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
