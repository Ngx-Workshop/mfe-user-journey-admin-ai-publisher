import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { AddressForm } from '../../models/example-form.models';

@Component({
  selector: 'ngx-address-fields',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  template: `
    <fieldset class="address-fields" [formGroup]="form()">
      <legend>Address (optional)</legend>
      <p>Provide all four fields to save an address.</p>
      @if (editing()) { <p>Clearing all fields keeps the saved address.</p> }
      <div class="address-fields__grid">
        @for (field of fields; track field.control) {
          <mat-form-field appearance="outline">
            <mat-label>{{ field.label }}</mat-label>
            <input matInput [formControlName]="field.control" />
          </mat-form-field>
        }
      </div>
      @if (form().hasError('incompleteAddress') && form().touched) {
        <p class="address-fields__error" role="alert">Complete all address fields or leave them all blank.</p>
      }
    </fieldset>
  `,
  styles: [`
    .address-fields { border: 1px solid var(--mat-sys-outline-variant); padding: 16px; }
    .address-fields__grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .address-fields__error { color: var(--mat-sys-error); }
    @media (max-width: 600px) { .address-fields__grid { grid-template-columns: minmax(0, 1fr); } }
  `],
})
export class AddressFieldsComponent {
  readonly form = input.required<AddressForm>();
  readonly editing = input(false);
  readonly fields = [
    { control: 'street', label: 'Street' }, { control: 'city', label: 'City' },
    { control: 'state', label: 'State' }, { control: 'zip', label: 'ZIP' },
  ];
}
