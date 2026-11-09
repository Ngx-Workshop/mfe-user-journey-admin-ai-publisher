import { NgTemplateOutlet } from '@angular/common';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'ngx-publishing-source',
  imports: [
    NgxButton,
    NgTemplateOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (expanded()) {
      <section
        class="source source--expanded"
        aria-label="Workshop draft JSON editor"
      >
        <ng-container [ngTemplateOutlet]="editor" />
      </section>
    } @else {
      <details class="source">
        <summary class="source__summary">
          Import or edit workshop draft JSON
        </summary>
        <ng-container [ngTemplateOutlet]="editor" />
      </details>
    }
    <ng-template #editor>
      <mat-form-field class="source__field" appearance="outline">
        <mat-label>Workshop draft</mat-label>
        <textarea
          matInput
          [formControl]="json()"
          rows="16"
          [readonly]="locked()"
        ></textarea>
      </mat-form-field>
      <button
        mat-flat-button
        ngxButton
        surface="outline"
        type="button"
        [disabled]="locked()"
        (click)="validate.emit()"
      >
        Validate changes
      </button>
    </ng-template>
  `,
  styles: [
    `
      .source {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius);
      }
      .source--expanded {
        margin: 0;
        padding: 0;
        border: 0;
      }
      .source--expanded textarea {
        font-family: var(--ngx-font-mono);
      }
      .source__summary {
        cursor: pointer;
        padding: 0.5rem;
        font-weight: 600;
      }
      .source__field {
        width: 100%;
      }
    `,
  ],
})
export class PublishingSourceComponent {
  readonly json = input.required<FormControl<string>>();
  readonly locked = input(false);
  readonly expanded = input(false);
  readonly validate = output<void>();
}
