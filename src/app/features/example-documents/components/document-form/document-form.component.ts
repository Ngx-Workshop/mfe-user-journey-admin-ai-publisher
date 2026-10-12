import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { CreateForm } from '../../models/example-form.models';
import { AddressFieldsComponent } from './address-fields.component';

@Component({
  selector: 'ngx-document-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatCheckboxModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, AddressFieldsComponent],
  template: `
    <div class="document-form" [formGroup]="form()">
      <mat-form-field appearance="outline">
        <mat-label>Name</mat-label>
        <input matInput formControlName="name" required />
        @if (form().controls.name.hasError('required')) { <mat-error>Name is required</mat-error> }
        @if (form().controls.name.hasError('maxlength')) { <mat-error>Use at most 120 characters</mat-error> }
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Type</mat-label>
        <mat-select formControlName="type" required>
          <mat-option value="SOME_ENUM">Some Enum</mat-option>
          <mat-option value="SOME_OTHER_ENUM">Some Other Enum</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Description</mat-label>
        <textarea matInput formControlName="description" rows="4"></textarea>
        <mat-hint>Optional</mat-hint>
        @if (form().controls.description.hasError('maxlength')) { <mat-error>Use at most 1000 characters</mat-error> }
      </mat-form-field>
      <mat-checkbox formControlName="archived">Archived</mat-checkbox>
      <ngx-address-fields [form]="form().controls.exampleMongodbDocObject" [editing]="editing()" />
    </div>
  `,
  styles: [`
    :host { display: block; }
    .document-form { display: flex; flex-direction: column; gap: 12px; }
  `],
})
export class DocumentFormComponent {
  readonly form = input.required<CreateForm>();
  readonly editing = input(false);
}
