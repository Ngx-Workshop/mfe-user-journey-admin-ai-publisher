import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
import { WorkshopDraft } from '../models/publishing.models';
import { previewBlock } from '../utils/publishing-preview';

@Component({
  selector: 'ngx-publishing-document-preview',
  imports: [NgxCodeBlock],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="document" aria-label="Documentation page preview">
      <p class="document__eyebrow">
        DOCUMENTATION / PAGE {{ number() }}
      </p>
      <h3>{{ page().name }}</h3>
      @for (block of blocks(); track $index) {
        @switch (block.kind) {
          @case ('heading') {
            <h4 class="document__block" [innerHTML]="block.text"></h4>
          }
          @case ('html') {
            <div
              class="document__block"
              [innerHTML]="block.text"
            ></div>
          }
          @case ('quote') {
            <blockquote
              class="document__block"
              [innerHTML]="block.text"
            ></blockquote>
          }
          @case ('panel') {
            <aside
              class="document__callout"
              [innerHTML]="block.text"
            ></aside>
          }
          @case ('image') {
            <figure class="document__figure">
              <img
                [src]="block.url"
                [alt]="block.alt"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <figcaption>{{ block.alt }}</figcaption>
            </figure>
          }
          @case ('code') {
            <ngx-code-block
              [code]="block.text"
              [label]="block.label"
              language="typescript"
              [wrap]="true"
            />
          }
          @default {
            <p class="document__note">
              {{ block.label }}. This block runs in the published
              workshop.
            </p>
            <ngx-code-block
              [code]="block.text"
              [label]="block.label"
              [wrap]="true"
            />
          }
        }
      } @empty {
        <p class="document__note">This page has no content blocks.</p>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .document {
      max-width: 78ch;
      margin-inline: auto;
      overflow-wrap: anywhere;
      line-height: 1.8;
    }
    .document__eyebrow {
      color: var(--ngx-color-primary);
      font: 0.7rem var(--ngx-font-mono);
      letter-spacing: 0.08em;
    }
    h3 {
      font-size: 1.75rem;
      line-height: 1.25;
      margin: 0.75rem 0 1.5rem;
    }
    h4 {
      font-size: 1.25rem;
    }
    .document__block {
      margin-block: 1.25rem;
    }
    blockquote,
    .document__callout {
      border-left: 3px solid var(--ngx-color-primary);
      padding: 0.75rem 1.25rem;
      background: var(--ngx-color-surface-high);
    }
    .document__figure {
      margin: 1.5rem 0;
    }
    img {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
      display: block;
      margin-inline: auto;
    }
    figcaption,
    .document__note {
      color: var(--ngx-color-muted);
      font-size: 0.85rem;
    }
    figcaption {
      text-align: center;
    }
    ngx-code-block {
      display: block;
      min-width: 0;
      margin-block: 1.25rem;
      position: relative;
    }
    .document__block {
      overflow-x: auto;
    }
  `,
})
export class PublishingDocumentPreviewComponent {
  readonly page = input.required<WorkshopDraft['pages'][number]>();
  readonly number = input(1);
  readonly blocks = computed(() =>
    [...this.page().blocks]
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map(previewBlock)
  );
}
