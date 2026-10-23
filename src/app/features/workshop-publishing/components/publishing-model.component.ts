import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublishingModelCatalog } from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-model',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="model" aria-label="Workshop model options">
      <mat-form-field class="model__field" appearance="outline">
        <mat-label>AI model</mat-label>
        <select matNativeControl [formControl]="model()" required [attr.disabled]="locked() ? '' : null">
          <option value="">Choose an AI model</option>
          @for (option of catalog()?.models ?? []; track option.id) {
            <option [value]="option.id">{{ option.id }} —
              {{ price(option.inputUsdPerMillion) }} input /
              {{ price(option.outputUsdPerMillion) }} output per 1M tokens</option>
          }
        </select>
      </mat-form-field>
      <p>Reference USD rates for standard short-context requests; total cost depends on token usage.
        <a href="https://developers.openai.com/api/docs/pricing" target="_blank" rel="noopener">Current pricing</a>
      </p>
      @for (error of errors(); track $index) { <p class="model__error" role="alert">{{ error }}</p> }
    </section>
  `,
  styles: [`
    .model__field { width: 100%; }
    .model__error { color: var(--mat-sys-error); }
  `],
})
export class PublishingModelComponent {
  readonly model = input.required<FormControl<string>>();
  readonly catalog = input<PublishingModelCatalog | null>(null);
  readonly errors = input<readonly string[]>([]);
  readonly locked = input(false);

  price(value: number | null): string {
    return value === null ? 'Price unavailable' : '$' + value.toFixed(2);
  }
}
