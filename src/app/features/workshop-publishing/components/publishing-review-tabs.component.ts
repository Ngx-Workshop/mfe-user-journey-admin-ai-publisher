import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  model,
} from '@angular/core';
import { PublishingReviewOutlineComponent } from './publishing-review-outline.component';
import { WorkshopDraft } from '../models/publishing.models';

export type PreviewSection = 'pages' | 'labs' | 'assessment';

@Component({
  selector: 'ngx-publishing-review-tabs',
  imports: [PublishingReviewOutlineComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="review__navigation">
      <div
        class="review__tabs"
        role="tablist"
        aria-label="Preview material type"
        [attr.aria-orientation]="
          vertical() ? 'vertical' : 'horizontal'
        "
      >
        @for (tab of tabs; track tab.id; let index = $index) {
          <button
            [style.grid-row]="vertical() ? index * 2 + 1 : null"
            type="button"
            role="tab"
            [id]="tabId(tab.id)"
            [attr.aria-selected]="section() === tab.id"
            [attr.aria-controls]="panelId()"
            [tabIndex]="section() === tab.id ? 0 : -1"
            (click)="section.set(tab.id)"
            (keydown)="navigateTab($event, tab.id)"
          >
            {{ tab.label }} ({{ count(tab.id) }})
          </button>
        }
      </div>
      @if (showOutline()) {
        <ngx-publishing-review-outline
          class="review__outline"
          [style.grid-row]="vertical() ? outlineRow() : null"
          [draft]="draft()"
          [section]="section()"
          [(selected)]="selected"
        />
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .review__tabs {
      display: flex;
      gap: 0.25rem;
      margin: var(--review-tabs-margin, 1.5rem 0 0);
      border-bottom: 1px solid var(--ngx-color-border);
      overflow-x: auto;
    }
    .review__tabs button {
      flex: 1;
      padding: 0.85rem 0.6rem;
      background: transparent;
      border: 0;
      border-bottom: 3px solid transparent;
      color: var(--ngx-color-muted);
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .review__tabs [aria-selected='true'] {
      border-bottom-color: var(--ngx-color-primary);
      color: var(--ngx-color-primary);
      background: var(--ngx-color-surface-high);
    }

    :host([data-vertical='true']) .review__navigation {
      display: grid;
    }
    :host([data-vertical='true']) .review__tabs {
      display: contents;
      margin: 0;
      border-bottom: 0;
    }
    :host([data-vertical='true']) button {
      text-align: left;
      white-space: normal;
      border-bottom: 0;
      border-inline-start: 3px solid transparent;
      min-height: 48px;
    }
    :host([data-vertical='true']) [aria-selected='true'] {
      border-inline-start-color: var(--ngx-color-primary);
    }
    button:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: -2px;
    }
  `,
  host: { '[attr.data-vertical]': 'vertical()' },
})
export class PublishingReviewTabsComponent {
  readonly draft = input.required<WorkshopDraft>();
  readonly panelId = input.required<string>();
  readonly vertical = input(false);
  readonly showOutline = input(false);
  readonly selected = model(0);
  outlineRow(): number {
    return (
      this.tabs.findIndex((tab) => tab.id === this.section()) * 2 + 2
    );
  }
  constructor() {
    effect(() => {
      this.draft();
      this.section();
      this.selected.set(0);
    });
  }
  readonly section = model<PreviewSection>('pages');
  readonly tabs: { id: PreviewSection; label: string }[] = [
    { id: 'pages', label: 'Documentation' },
    { id: 'labs', label: 'Coding labs' },
    { id: 'assessment', label: 'Assessment' },
  ];
  tabId(section: PreviewSection): string {
    return `${this.panelId()}-${section}`;
  }
  count(section: PreviewSection): number {
    return section === 'assessment'
      ? this.draft().assessment.testQuestions.length
      : this.draft()[section].length;
  }
  navigateTab(event: KeyboardEvent, section: PreviewSection): void {
    const index = this.tabs.findIndex((tab) => tab.id === section);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 2
          : event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? (index + 1) % 3
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
              ? (index + 2) % 3
              : -1;
    if (next < 0) return;
    event.preventDefault();
    this.section.set(this.tabs[next].id);
    const button = event.currentTarget;
    if (button instanceof HTMLElement) {
      button.parentElement
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        [next]?.focus();
    }
  }
}
