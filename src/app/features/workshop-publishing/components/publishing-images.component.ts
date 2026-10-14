import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { WorkshopImage } from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-images',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details class="images">
      <summary class="images__summary">Workshop image (optional)</summary>
      <p>Select an asset or generate an image, then add it to the first documentation page of a reviewed draft.</p>
      <mat-form-field class="images__field" appearance="outline">
        <mat-label>Search image assets</mat-label>
        <input matInput [formControl]="query()" maxlength="120" />
      </mat-form-field>
      <button class="images__button" mat-stroked-button type="button"
        [disabled]="locked() || initializing()" (click)="browse.emit()">Browse image assets</button>
      <div class="images__list">
        @for (image of images(); track image.storageUrl) {
          <button class="images__asset" type="button" [disabled]="locked()"
            (click)="select.emit(image)" [attr.aria-label]="'Select ' + image.name">
            <img class="images__thumbnail" [src]="image.storageUrl" [alt]="image.name" loading="lazy" />
            <span>{{ image.name }}</span>
          </button>
        } @empty { <p>No image assets loaded. Browse or change the search.</p> }
      </div>
      <mat-form-field class="images__field" appearance="outline">
        <mat-label>Image prompt</mat-label>
        <textarea matInput [formControl]="prompt()" rows="3" maxlength="4000" [readonly]="locked()"></textarea>
      </mat-form-field>
      <p>Generate with {{ imageModel() ?? 'the configured image model' }}.
        This incurs a separate image charge and saves the result to assets.</p>
      <button class="images__button" mat-stroked-button type="button"
        [disabled]="locked() || initializing() || prompt().invalid" (click)="generate.emit()">
        Generate workshop image
      </button>
      @if (selected(); as image) {
        <figure>
          <img class="images__preview" [src]="image.storageUrl" [alt]="image.name" />
          <figcaption>{{ image.name }}</figcaption>
        </figure>
        <button class="images__button" mat-stroked-button type="button"
          [disabled]="locked() || !hasDraft()" (click)="apply.emit()">Add image to workshop draft</button>
      }
    </details>
  `,
  styles: [`
    .images__field { width: 100%; }
    .images__summary { cursor: pointer; font-weight: 600; padding: 1rem 0; }
    .images__list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .images__asset {
      display: grid;
      gap: 0.5rem;
      padding: 0.5rem;
      cursor: pointer;
      border: 1px solid var(--mat-sys-outline-variant);
      background: var(--mat-sys-surface);
      color: var(--mat-sys-on-surface);
    }
    .images__thumbnail { width: 100%; height: 100px; object-fit: contain; }
    .images__preview { max-width: 100%; max-height: 240px; }
    .images__button { margin: 0.5rem; }
  `],
})
export class PublishingImagesComponent {
  readonly query = input.required<FormControl<string>>();
  readonly prompt = input.required<FormControl<string>>();
  readonly images = input.required<readonly WorkshopImage[]>();
  readonly selected = input<WorkshopImage | null>(null);
  readonly imageModel = input<string | null>(null);
  readonly locked = input(false);
  readonly initializing = input(false);
  readonly hasDraft = input(false);
  readonly browse = output<void>();
  readonly select = output<WorkshopImage>();
  readonly generate = output<void>();
  readonly apply = output<void>();
}
