import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { EditorViewModel } from '../../../../../../src/app/features/example-documents/components/editor/editor.view-model';
import { exampleDocument } from '../../../../../fixtures/example-document';

describe('Scoped editor view model', () => {
  let vm: EditorViewModel;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [EditorViewModel, provideHttpClient(), provideHttpClientTesting()] });
    vm = TestBed.inject(EditorViewModel);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  it('keeps failed form input, blocks duplicate saves, and succeeds on retry', () => {
    const saved = jasmine.createSpy('saved');
    vm.saved$.subscribe(saved);
    vm.initialize({ mode: 'edit', doc: exampleDocument });
    vm.form.patchValue({ description: '', archived: false });
    vm.save();
    vm.save();
    const first = http.expectOne('/api/example-crud/doc-1');
    expect(first.request.body.description).toBe('');
    expect(first.request.body.archived).toBeFalse();
    expect(vm.submitting()).toBeTrue();
    expect(vm.form.disabled).toBeTrue();
    first.flush({ message: 'Save interrupted' }, { status: 503, statusText: 'Unavailable' });
    expect(saved).not.toHaveBeenCalled();
    expect(vm.error()).toBe('Save interrupted');
    expect(vm.form.getRawValue().archived).toBeFalse();
    expect(vm.form.enabled).toBeTrue();
    vm.save();
    http.expectOne('/api/example-crud/doc-1').flush(exampleDocument);
    http.expectOne('/api/example-crud').flush([exampleDocument]);
    expect(saved).toHaveBeenCalledOnceWith(exampleDocument);
    expect(vm.error()).toBe('');
  });
  it('does not save an invalid or unavailable document', () => {
    vm.save();
    expect(vm.form.touched).toBeTrue();
    http.expectNone('/api/example-crud');
    vm.initialize({ mode: 'edit' });
    vm.form.controls.name.setValue('Example');
    vm.save();
    expect(vm.error()).toContain('unavailable');
    http.expectNone('/api/example-crud');
  });
  it('cancels an in-flight save on injector teardown', () => {
    vm.form.controls.name.setValue('Example');
    vm.save();
    const request = http.expectOne('/api/example-crud');
    TestBed.resetTestingModule();
    expect(request.cancelled).toBeTrue();
  });
});
