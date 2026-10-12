import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ExampleCrudApiService } from '../../../../../src/app/features/example-documents/api/example-crud-api.service';

describe('Stateless example HTTP client', () => {
  let api: ExampleCrudApiService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    api = TestBed.inject(ExampleCrudApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('uses canonical collection URLs and generated create payloads', () => {
    api.list$().subscribe();
    http.expectOne('/api/example-crud').flush([]);
    const dto = { name: 'New', type: 'SOME_ENUM' as const, archived: false, description: '' };
    api.create$(dto).subscribe();
    const request = http.expectOne('/api/example-crud');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);
    request.flush({});
  });
  it('encodes IDs once and preserves explicit patch values', () => {
    const url = '/api/example-crud/id%2Fwith%20space';
    api.getById$('id/with space').subscribe();
    http.expectOne(url).flush({});
    api.update$('id/with space', { archived: false, description: '' }).subscribe();
    const patch = http.expectOne(url);
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ archived: false, description: '' });
    patch.flush({});
    api.delete$('id/with space').subscribe();
    const deletion = http.expectOne(url);
    expect(deletion.request.method).toBe('DELETE');
    deletion.flush(null);
  });
});
