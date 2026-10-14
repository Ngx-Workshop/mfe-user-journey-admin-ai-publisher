import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublishingViewModel } from '../pages/publishing.view-model';
@Component({
  selector: 'ngx-publishing-options',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="options"
      aria-label="Workshop model and image options"
    >
      <mat-form-field appearance="outline">
        <mat-label>AI model</mat-label>
        <select
          matNativeControl
          [formControl]="vm.model"
          required
          [attr.disabled]="
            vm.busy() || vm.initializing() || vm.attempted()
              ? ''
              : null
          "
        >
          <option value="">Choose an AI model</option>
          @for (model of vm.catalog()?.models ?? []; track model.id) {
            <option [value]="model.id">
              {{ model.id }} —
              {{ price(model.inputUsdPerMillion) }} input /
              {{ price(model.outputUsdPerMillion) }} output per 1M
              tokens
            </option>
          }
        </select>
      </mat-form-field>
      <p>
        Reference USD rates for standard short-context requests; total
        cost depends on token usage.
        <a
          href="https://developers.openai.com/api/docs/pricing"
          target="_blank"
          rel="noopener"
          >Current pricing</a
        >
      </p>
      <button
        mat-stroked-button
        type="button"
        [disabled]="vm.busy() || vm.initializing()"
        (click)="vm.initialize()"
      >
        Reload sections, models and history
      </button>
      @for (error of vm.setupErrors(); track $index) {
        <p class="options__error" role="alert">{{ error }}</p>
      }
      <details>
        <summary>Workshop image (optional)</summary>
        <p>
          Select an asset or generate an image, then add it to the
          first documentation page of a reviewed draft.
        </p>
        <mat-form-field appearance="outline"
          ><mat-label>Search image assets</mat-label
          ><input
            matInput
            [formControl]="vm.imageQuery"
            maxlength="120"
        /></mat-form-field>
        <button
          mat-stroked-button
          type="button"
          [disabled]="
            vm.busy() || vm.initializing() || vm.attempted()
          "
          (click)="vm.browseImages()"
        >
          Browse image assets
        </button>
        <div class="options__images">
          @for (image of vm.images(); track image.storageUrl) {
            <button
              class="options__asset"
              type="button"
              [disabled]="vm.busy() || vm.attempted()"
              (click)="vm.selectImage(image)"
              [attr.aria-label]="'Select ' + image.name"
            >
              <img
                [src]="image.storageUrl"
                [alt]="image.name"
                loading="lazy"
              /><span>{{ image.name }}</span>
            </button>
          } @empty {
            <p>
              No image assets loaded. Browse or change the search.
            </p>
          }
        </div>
        <mat-form-field appearance="outline"
          ><mat-label>Image prompt</mat-label
          ><textarea
            matInput
            [formControl]="vm.imagePrompt"
            rows="3"
            maxlength="4000"
            [readonly]="vm.busy() || vm.attempted()"
          ></textarea>
        </mat-form-field>
        <p>
          Generate with
          {{
            vm.catalog()?.imageModel ?? 'the configured image model'
          }}. This incurs a separate image charge and saves the result
          to assets.
        </p>
        <button
          mat-stroked-button
          type="button"
          [disabled]="
            vm.busy() ||
            vm.initializing() ||
            vm.attempted() ||
            vm.imagePrompt.invalid
          "
          (click)="vm.generateImage()"
        >
          Generate workshop image
        </button>
        @if (vm.image(); as image) {
          <figure>
            <img
              class="options__preview"
              [src]="image.storageUrl"
              [alt]="image.name"
            />
            <figcaption>{{ image.name }}</figcaption>
          </figure>
          <button
            mat-stroked-button
            type="button"
            [disabled]="vm.busy() || vm.attempted() || !vm.draft()"
            (click)="vm.applyImage()"
          >
            Add image to workshop draft
          </button>
        }
      </details>
    </section>
  `,
  styles: [
    `
      mat-form-field {
        width: 100%;
      }
      .options__error {
        color: var(--mat-sys-error);
      }
      .options__images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 1rem;
        margin: 1rem 0;
      }
      .options__asset {
        display: grid;
        gap: 0.5rem;
        padding: 0.5rem;
        cursor: pointer;
        border: 1px solid var(--mat-sys-outline-variant);
        background: var(--mat-sys-surface);
        color: var(--mat-sys-on-surface);
      }
      .options__asset img {
        width: 100%;
        height: 100px;
        object-fit: contain;
      }
      .options__preview {
        max-width: 100%;
        max-height: 240px;
      }
      summary {
        cursor: pointer;
        font-weight: 600;
        padding: 1rem 0;
      }
      button {
        margin: 0.5rem;
      }
    `,
  ],
})
export class PublishingOptionsComponent {
  readonly vm = inject(PublishingViewModel);
  price(value: number | null): string {
    return value === null
      ? 'Price unavailable'
      : '$' + value.toFixed(2);
  }
}
