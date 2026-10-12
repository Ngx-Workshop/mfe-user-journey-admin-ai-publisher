import { TestBed } from '@angular/core/testing';
import { ExampleFormService } from '../../../../../src/app/features/example-documents/forms/example-form.service';

describe('Typed example request mapping', () => {
  const service = () => TestBed.inject(ExampleFormService);
  it('sends explicit false and empty values when editing', () => {
    const form = service().createCreateForm({ name: 'Example', archived: true, description: 'Before' });
    form.patchValue({ archived: false, description: '' });
    expect(service().toPatchDto(form)).toEqual({ name: 'Example', type: 'SOME_ENUM', archived: false, description: '' });
  });
  it('requires a nonblank name and a complete optional address', () => {
    const form = service().createCreateForm({ name: '   ' });
    expect(form.invalid).toBeTrue();
    form.controls.name.setValue('Example');
    expect(form.valid).toBeTrue();
    form.controls.exampleMongodbDocObject.controls.street.setValue('Main');
    expect(form.invalid).toBeTrue();
    form.controls.exampleMongodbDocObject.patchValue({ city: 'City', state: 'NY', zip: '10001' });
    expect(form.valid).toBeTrue();
    expect(service().toCreateDto(form).exampleMongodbDocObject?.street).toBe('Main');
  });
  it('omits an empty address without inventing a null backend contract', () => {
    const form = service().createCreateForm({ name: 'Example' });
    expect(service().toPatchDto(form).exampleMongodbDocObject).toBeUndefined();
  });
});
