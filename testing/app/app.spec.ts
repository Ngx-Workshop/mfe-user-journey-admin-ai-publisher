import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { App } from '../../src/app/app';
import { exampleDocument } from '../fixtures/example-document';

describe('Seed example journey', () => {
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [App], providers: [
      provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(),
    ] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('renders the actual example title, typed cards and local search', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    http.expectOne('/api/example-crud').flush([exampleDocument]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Example MongoDB Docs');
    expect(element.querySelectorAll('ngx-example-mongodb-doc').length).toBe(1);
    const search = element.querySelector('input')!;
    search.value = 'No match';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(element.textContent).toContain('No matching documents');
  });
  it('renders loading, recoverable error and an honest empty state', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('mat-progress-bar')).toBeTruthy();
    http.expectOne('/api/example-crud').flush({}, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
    const button = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find(item => item.textContent?.includes('Retry loading'))!;
    button.click();
    http.expectOne('/api/example-crud').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No documents yet');
  });
});
