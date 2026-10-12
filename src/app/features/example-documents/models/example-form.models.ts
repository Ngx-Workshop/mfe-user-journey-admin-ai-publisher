import { FormControl, FormGroup } from '@angular/forms';
import type { CreateExampleMongodbDocDto } from './example-document.models';

export type AddressForm = FormGroup<{
  street: FormControl<string>;
  city: FormControl<string>;
  state: FormControl<string>;
  zip: FormControl<string>;
}>;
export type CreateForm = FormGroup<{
  name: FormControl<string>;
  type: FormControl<CreateExampleMongodbDocDto['type']>;
  description: FormControl<string>;
  archived: FormControl<boolean>;
  exampleMongodbDocObject: AddressForm;
}>;
