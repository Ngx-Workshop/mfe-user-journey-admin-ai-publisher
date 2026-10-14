import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-publishing-source',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details class="source">
      <summary class="source__summary">Import or edit workshop draft JSON</summary>
      <mat-form-field class="source__field" appearance="outline">
        <mat-label>Workshop draft</mat-label>
        <textarea matInput [formControl]="json()" rows="16" [readonly]="locked()"></textarea>
      </mat-form-field>
      <button mat-stroked-button type="button" [disabled]="locked()" (click)="validate.emit()">
        Validate changes
      </button>
    </details>
  `,
  styles: [`
    .source { margin-top: 1.5rem; padding: 1rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 0.5rem; }
    .source__summary { cursor: pointer; padding: 0.5rem; font-weight: 600; }
    .source__field { width: 100%; }
  `],
})
export class PublishingSourceComponent {
  readonly json = input.required<FormControl<string>>();
  readonly locked = input(false);
  readonly validate = output<void>();
}
