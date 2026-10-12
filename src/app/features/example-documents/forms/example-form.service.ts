import { Injectable, inject } from '@angular/core';
import { FormBuilder, ValidatorFn, Validators } from '@angular/forms';
import type {
  CreateExampleMongodbDocDto, UpdateExampleMongodbDocDto,
} from '../models/example-document.models';
import type { CreateForm } from '../models/example-form.models';

const nonBlank: ValidatorFn = control =>
  typeof control.value === 'string' && control.value.trim() ? null : { required: true };
const optionalAddress: ValidatorFn = group => {
  const values = ['street', 'city', 'state', 'zip'].map(key => {
    const value: unknown = group.get(key)?.value;
    return typeof value === 'string' ? value.trim() : '';
  });
  return values.some(Boolean) && !values.every(Boolean) ? { incompleteAddress: true } : null;
};

/** Stateless typed form factory and explicit request mapping. */
@Injectable({ providedIn: 'root' })
export class ExampleFormService {
  private readonly fb = inject(FormBuilder).nonNullable;
  createCreateForm(initial?: Partial<CreateExampleMongodbDocDto>): CreateForm {
    const address = initial?.exampleMongodbDocObject;
    return this.fb.group({
      name: this.fb.control(initial?.name ?? '', [nonBlank, Validators.maxLength(120)]),
      type: this.fb.control<CreateExampleMongodbDocDto['type']>(initial?.type ?? 'SOME_ENUM', Validators.required),
      description: this.fb.control(initial?.description ?? '', Validators.maxLength(1000)),
      archived: this.fb.control(initial?.archived ?? false),
      exampleMongodbDocObject: this.fb.group({
        street: address?.street ?? '', city: address?.city ?? '',
        state: address?.state ?? '', zip: address?.zip ?? '',
      }, { validators: optionalAddress }),
    });
  }
  toCreateDto(form: CreateForm): CreateExampleMongodbDocDto {
    const value = form.getRawValue();
    const address = value.exampleMongodbDocObject;
    const dto: CreateExampleMongodbDocDto = {
      name: value.name.trim(), type: value.type,
      description: value.description.trim(), archived: value.archived,
    };
    if (Object.values(address).some(field => field.trim())) {
      dto.exampleMongodbDocObject = {
        street: address.street.trim(), city: address.city.trim(),
        state: address.state.trim(), zip: address.zip.trim(),
      };
    }
    return dto;
  }
  toPatchDto(form: CreateForm): UpdateExampleMongodbDocDto {
    return this.toCreateDto(form);
  }
}
