import { FormControl, FormGroup } from '@angular/forms';

export type PublishingForm = FormGroup<{
  brief: FormControl<string>;
  sectionId: FormControl<string>;
  level: FormControl<number>;
}>;
