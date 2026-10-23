import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublishingForm } from '../forms/publishing-form';

@Component({
  selector: 'ngx-publishing-brief',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="brief" [formGroup]="form()" (ngSubmit)="generate.emit()">
      <div class="brief__fields">
        <mat-form-field class="brief__field" appearance="outline">
          <mat-label>Workshop section</mat-label>
          <select matNativeControl formControlName="sectionId" required
            [attr.disabled]="locked() || initializing() ? '' : null">
            <option value="">{{ initializing() ? 'Loading sections…' : 'Choose a section' }}</option>
            @for (section of sections(); track section.id) {
              <option [value]="section.id">{{ section.name }}</option>
            }
          </select>
          @if (!initializing() && !sections().length) {
            <mat-hint>No sections available.</mat-hint>
          }
        </mat-form-field>
        <mat-form-field class="brief__field" appearance="outline">
          <mat-label>Level</mat-label>
          <input matInput type="number" formControlName="level" min="1" max="20" required [readonly]="locked()" />
        </mat-form-field>
      </div>
      <mat-form-field class="brief__field brief__prompt" appearance="outline" subscriptSizing="dynamic">
        <mat-label>Workshop brief</mat-label>
        <textarea matInput formControlName="brief" rows="5" required [readonly]="locked()"
          placeholder="Example: Teach Angular signals to TypeScript developers. Build a counter, explain computed values and effects, and include a hands-on lab."></textarea>
        <mat-hint>Describe the topic, audience, prerequisites and learning objectives. Include a practical example
          and any constraints, such as duration or technologies to use.</mat-hint>
      </mat-form-field>
      <button mat-flat-button type="submit"
        [disabled]="locked() || initializing() || form().invalid || !modelValid()">
        Generate workshop draft
      </button>
    </form>
  `,
  styles: [`
    .brief__field { width: 100%; }
    .brief__prompt { margin-bottom: 1rem; }
    .brief__fields { display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; }
    @media (max-width: 600px) { .brief__fields { grid-template-columns: 1fr; } }
  `],
})
export class PublishingBriefComponent {
  readonly form = input.required<PublishingForm>();
  readonly sections = input.required<readonly { id: string; name: string }[]>();
  readonly locked = input(false);
  readonly initializing = input(false);
  readonly modelValid = input(false);
  readonly generate = output<void>();
}
