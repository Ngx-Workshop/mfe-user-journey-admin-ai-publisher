import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';
import { WorkshopDraft } from '../../models/publishing.models';
import type { PreviewSection } from './publishing-review-tabs.component';

@Component({
  selector: 'ngx-publishing-review-outline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="outline" aria-label="Workshop material outline">
      <h3>{{ heading() }}</h3>
      @for (item of items(); track $index; let index = $index) {
        <button
          type="button"
          class="outline__item"
          [attr.aria-current]="selected() === index ? 'true' : null"
          (click)="selected.set(index)"
        >
          <span>{{ index + 1 }}</span
          ><span>{{ item }}</span>
        </button>
      } @empty {
        <p>No {{ heading().toLowerCase() }} in this draft.</p>
      }
    </nav>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .outline {
      padding: 0.75rem;
      color: var(--ngx-color-text);
    }
    h3 {
      margin: 0 0 0.5rem;
      font-size: 0.8rem;
      color: var(--ngx-color-muted);
    }
    .outline__item {
      display: flex;
      width: 100%;
      gap: 0.5rem;
      padding: 0.7rem 0.5rem;
      border: 1px solid transparent;
      background: transparent;
      color: inherit;
      text-align: left;
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
      overflow-wrap: anywhere;
    }
    .outline__item > span:last-child {
      min-width: 0;
    }
    .outline__item[aria-current] {
      background: var(--ngx-color-surface-high);
      border-color: var(--ngx-color-primary);
    }
    button:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: -2px;
    }
  `,
})
export class PublishingReviewOutlineComponent {
  readonly draft = input.required<WorkshopDraft>();
  readonly section = input.required<PreviewSection>();
  readonly selected = model(0);
  readonly heading = computed(() =>
    this.section() === 'pages'
      ? 'Documentation pages'
      : this.section() === 'labs'
        ? 'Coding labs'
        : 'Assessment questions'
  );
  readonly items = computed(() =>
    this.section() === 'pages'
      ? this.draft().pages.map((page) => page.name)
      : this.section() === 'labs'
        ? this.draft().labs.map((lab) => lab.metadata.title)
        : this.draft().assessment.testQuestions.map(
            (question) => question.question
          )
  );
}
