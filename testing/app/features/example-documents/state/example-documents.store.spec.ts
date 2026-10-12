import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExampleDocumentsStore } from '../../../../../src/app/features/example-documents/state/example-documents.store';
import { exampleDocument } from '../../../../fixtures/example-document';

describe('Shared example documents store', () => {
  let store: ExampleDocumentsStore;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    store = TestBed.inject(ExampleDocumentsStore);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('cancels superseded reads and retains records on a recoverable reload failure', () => {
    store.reload();
    const first = http.expectOne('/api/example-crud');
    store.reload();
    expect(first.cancelled).toBeTrue();
    expect(store.loading()).toBeTrue();
    http.expectOne('/api/example-crud').flush([exampleDocument]);
    store.reload();
    http.expectOne('/api/example-crud').flush({ message: 'Unavailable' }, { status: 503, statusText: 'Unavailable' });
    expect(store.documents()).toEqual([exampleDocument]);
    expect(store.error()).toBe('Unavailable');
    expect(store.loading()).toBeFalse();
    store.reload();
    http.expectOne('/api/example-crud').flush([]);
    expect(store.error()).toBe('');
  });
  it('refreshes shared data after a successful mutation, including when the read fails', () => {
    const saved = jasmine.createSpy('saved');
    store.update('doc-1', { archived: false }).subscribe(saved);
    expect(store.mutating()).toBeTrue();
    http.expectOne('/api/example-crud/doc-1').flush({ ...exampleDocument, archived: false });
    expect(saved).toHaveBeenCalledOnceWith({ ...exampleDocument, archived: false });
    expect(store.mutating()).toBeFalse();
    http.expectOne('/api/example-crud').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(store.error()).toContain('try again');
  });
  it('retains records after failed deletion and resets pending state on cancellation', () => {
    store.reload();
    http.expectOne('/api/example-crud').flush([exampleDocument]);
    const failed = jasmine.createSpy('failed');
    store.remove('doc-1').subscribe({ error: failed });
    http.expectOne('/api/example-crud/doc-1').flush({}, { status: 403, statusText: 'Forbidden' });
    expect(failed).toHaveBeenCalled();
    expect(store.documents()).toEqual([exampleDocument]);
    expect(store.mutating()).toBeFalse();
    const subscription = store.remove('doc-1').subscribe();
    const request = http.expectOne('/api/example-crud/doc-1');
    subscription.unsubscribe();
    expect(request.cancelled).toBeTrue();
    expect(store.mutating()).toBeFalse();
  });
});
