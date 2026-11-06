import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { previewBlock } from '../utils/publishing-preview';
import { WorkshopDraft } from '../models/publishing.models';
import { PublishingDocumentPreviewComponent } from './publishing-document-preview.component';
import { PublishingLabPreviewComponent } from './publishing-lab-preview.component';
import { PublishingAssessmentPreviewComponent } from './publishing-assessment-preview.component';

type PreviewSection = 'pages' | 'labs' | 'assessment';

@Component({
  selector: 'ngx-publishing-review',
  imports: [
    NgxButton,
    MatButtonModule,
    PublishingDocumentPreviewComponent,
    PublishingLabPreviewComponent,
    PublishingAssessmentPreviewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="review">
      <header class="review__header">
        <div class="review__image">
          @if (image(); as cover) {
            <img [src]="cover.url" [alt]="cover.alt" />
          } @else {
            <span>No workshop image</span>
          }
        </div>
        <div class="review__info">
        <p class="review__eyebrow">
          WORKSHOP PREVIEW / LEVEL {{ draft().level }}
        </p>
        <h2>{{ draft().name }}</h2>
        <p class="review__summary">{{ draft().summary }}</p>
        <p class="review__note">
          Explore the materials below before approving publication.
          This is an unpublished draft.
        </p>
        </div>
      </header>
      <div class="review__tabs" role="tablist" aria-label="Preview material type">
        @for (tab of tabs; track tab.id) {
          <button type="button" role="tab" [id]="tabId(tab.id)"
            [attr.aria-selected]="section() === tab.id"
            [attr.aria-controls]="panelId"
            [tabIndex]="section() === tab.id ? 0 : -1"
            (click)="select(tab.id)" (keydown)="navigateTab($event, tab.id)">
            {{ tab.label }} ({{ count(tab.id) }})
          </button>
        }
      </div>
      <div
        class="review__workspace" role="tabpanel" [id]="panelId"
        [attr.aria-labelledby]="tabId(section())"
        [class.review__workspace--assessment]="
          section() === 'assessment'
        "
      >
        @if (section() !== 'assessment') {
          <nav
            class="review__outline"
            aria-label="Workshop material outline"
          >
            <h3>
              {{
                section() === 'pages'
                  ? 'Documentation pages'
                  : 'Coding labs'
              }}
            </h3>
            @for (item of items(); track $index; let index = $index) {
              <button
                type="button"
                class="review__item"
                [attr.aria-current]="
                  selected() === index ? 'true' : null
                "
                (click)="selected.set(index)"
              >
                <span>{{ index + 1 }}</span
                ><span>{{ item }}</span>
              </button>
            } @empty {
              <p>
                No
                {{
                  section() === 'pages'
                    ? 'documentation pages'
                    : 'coding labs'
                }}
                in this draft.
              </p>
            }
          </nav>
        }
        <section
          class="review__preview"
          aria-label="Selected material preview"
          tabindex="0"
        >
          @if (section() === 'pages') {
            @if (draft().pages[selected()]; as page) {
              <ngx-publishing-document-preview
                [page]="page"
                [number]="selected() + 1"
              />
            } @else {
              <p>
                No documentation to preview. Edit and validate the
                draft to add pages.
              </p>
            }
          } @else if (section() === 'labs') {
            @if (draft().labs[selected()]; as lab) {
              <ngx-publishing-lab-preview [lab]="lab" />
            } @else {
              <p>
                No coding labs to preview. Edit and validate the draft
                to add a lab.
              </p>
            }
          } @else {
            <ngx-publishing-assessment-preview
              [assessment]="draft().assessment"
            />
          }
        </section>
      </div>
      @if (showPublish()) {
        <p>
          Publishing makes these resources available immediately.
          Coding labs must pass verification first.
        </p>
        <button
          mat-flat-button
          ngxButton
          type="button"
          [disabled]="locked()"
          (click)="publish.emit()"
        >
          Publish reviewed workshop
        </button>
      }
    </article>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .review__header {
      display: grid;
      grid-template-columns: minmax(150px, 28%) minmax(0, 1fr);
      align-items: center;
      gap: 1.5rem;
    }
    .review__image {
      aspect-ratio: 16 / 10;
      display: grid;
      place-items: center;
      background: var(--ngx-color-canvas);
      border: 1px solid var(--ngx-color-border);
      color: var(--ngx-color-muted);
      font-size: .8rem;
      overflow: hidden;
    }
    .review__image img { width: 100%; height: 100%; object-fit: cover; }
    .review__info { min-width: 0;
    }
    h2 {
      font-size: clamp(1.5rem, 3vw, 2.25rem);
      line-height: 1.2;
      margin: 0.75rem 0;
      overflow-wrap: anywhere;
    }
    .review__eyebrow {
      color: var(--ngx-color-primary);
      font: 0.7rem var(--ngx-font-mono);
      letter-spacing: 0.06em;
    }
    .review__summary {
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
    .review__note {
      color: var(--ngx-color-muted);
      font-size: 0.85rem;
    }
    .review__tabs {
      display: flex;
      gap: .25rem;
      margin: 1.5rem 0 0;
      border-bottom: 1px solid var(--ngx-color-border);
      overflow-x: auto;
    }
    .review__tabs button {
      flex: 1;
      padding: .85rem .6rem;
      background: transparent;
      border: 0;
      border-bottom: 3px solid transparent;
      color: var(--ngx-color-muted);
      font: inherit;
      font-size: .85rem;
      cursor: pointer;
      white-space: nowrap;
    }
    .review__tabs [aria-selected='true'] {
      border-bottom-color: var(--ngx-color-primary);
      color: var(--ngx-color-primary);
      background: var(--ngx-color-surface-high);
    }
    .review__workspace {
      display: grid;
      grid-template-columns: minmax(150px, 190px) minmax(0, 1fr);
      border: 1px solid var(--ngx-color-border);
    }
    .review__workspace--assessment {
      grid-template-columns: minmax(0, 1fr);
    }
    .review__outline {
      background: var(--ngx-color-surface);
      padding: 1rem;
      min-width: 0;
    }
    .review__outline h3 {
      margin: 0 0 1rem;
      font-size: 0.85rem;
    }
    .review__item {
      display: flex;
      width: 100%;
      gap: 0.75rem;
      padding: 0.8rem;
      border: 1px solid transparent;
      background: transparent;
      color: var(--ngx-color-text);
      text-align: left;
      font: inherit;
      font-size: 0.85rem;
      cursor: pointer;
      overflow-wrap: anywhere;
    }
    .review__item > span:last-child {
      min-width: 0;
    }
    .review__item[aria-current] {
      background: var(--ngx-color-surface-high);
      border-color: var(--ngx-color-primary);
    }
    .review__preview {
      min-width: 0;
      padding: clamp(1rem, 3vw, 2rem);
      background: var(--ngx-color-canvas);
    }
    button:focus-visible,
    .review__preview:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: 2px;
    }
    @media (max-width: 800px) {
      .review__workspace {
        grid-template-columns: minmax(0, 1fr);
      }
      .review__outline {
        border-bottom: 1px solid var(--ngx-color-border);
        max-height: 200px;
        overflow: auto;
      }
      .review__header { grid-template-columns: minmax(0, 1fr); }
      .review__image { max-width: 320px; width: 100%; }
    }
  `,
})
export class PublishingReviewComponent {
  private static nextId = 0;
  readonly panelId = `workshop-material-${PublishingReviewComponent.nextId++}`;
  readonly tabs: { id: PreviewSection; label: string }[] = [
    { id: 'pages', label: 'Documentation' },
    { id: 'labs', label: 'Coding labs' },
    { id: 'assessment', label: 'Assessment' },
  ];
  readonly image = computed(() => this.draft().pages.flatMap(page =>
    [...page.blocks].sort((a, b) => a.sortIndex - b.sortIndex).map(previewBlock)
  ).find(block => block.kind === 'image'));
  tabId(section: PreviewSection): string { return `${this.panelId}-${section}`; }
  count(section: PreviewSection): number {
    return section === 'assessment' ? this.draft().assessment.testQuestions.length : this.draft()[section].length;
  }
  navigateTab(event: KeyboardEvent, section: PreviewSection): void {
    const index = this.tabs.findIndex(tab => tab.id === section);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2 :
      event.key === 'ArrowRight' ? (index + 1) % 3 : event.key === 'ArrowLeft' ? (index + 2) % 3 : -1;
    if (next < 0) return;
    event.preventDefault();
    this.select(this.tabs[next].id);
    const button = event.currentTarget;
    if (button instanceof HTMLElement) {
      button.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
    }
  }
  readonly draft = input.required<WorkshopDraft>();
  readonly locked = input(false);
  readonly showPublish = input(true);
  readonly publish = output<void>();
  readonly section = signal<PreviewSection>('pages');
  readonly selected = signal(0);
  readonly items = computed(() =>
    this.section() === 'pages'
      ? this.draft().pages.map((page) => page.name)
      : this.draft().labs.map((lab) => lab.metadata.title)
  );

  constructor() {
    effect(() => {
      this.draft();
      this.select('pages');
    });
  }
  select(section: PreviewSection): void {
    this.section.set(section);
    this.selected.set(0);
  }
}
