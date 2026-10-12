import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CatalogViewModel } from '../../../../../../src/app/features/example-documents/pages/catalog/catalog.view-model';
import { exampleDocument } from '../../../../../fixtures/example-document';

describe('Scoped catalog commands', () => {
  it('retains rows on failed deletion, guards duplicate deletes and refreshes on retry', () => {
    TestBed.configureTestingModule({ providers: [CatalogViewModel, provideHttpClient(), provideHttpClientTesting()] });
    const vm = TestBed.inject(CatalogViewModel);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne('/api/example-crud').flush([exampleDocument]);
    vm.remove(exampleDocument._id);
    vm.remove(exampleDocument._id);
    http.expectOne('/api/example-crud/doc-1').flush({ message: 'Delete interrupted' }, { status: 503, statusText: 'Unavailable' });
    expect(vm.deleteError()).toBe('Delete interrupted');
    expect(vm.documents()).toEqual([exampleDocument]);
    vm.remove(exampleDocument._id);
    http.expectOne('/api/example-crud/doc-1').flush(null);
    http.expectOne('/api/example-crud').flush([]);
    expect(vm.deleteError()).toBe('');
    expect(vm.documents()).toEqual([]);
    http.verify();
  });
});
