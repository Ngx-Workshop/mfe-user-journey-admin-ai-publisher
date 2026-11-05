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
        <p class="review__eyebrow">
          WORKSHOP PREVIEW / LEVEL {{ draft().level }}
        </p>
        <h2>{{ draft().name }}</h2>
        <p class="review__summary">{{ draft().summary }}</p>
        <p class="review__note">
          Explore the materials below before approving publication.
          This is an unpublished draft.
        </p>
      </header>
      <div
        class="review__tabs"
        role="group"
        aria-label="Preview material type"
      >
        <button
          mat-button
          ngxButton
          surface="outline"
          type="button"
          [attr.aria-pressed]="section() === 'pages'"
          (click)="select('pages')"
        >
          Documentation ({{ draft().pages.length }})
        </button>
        <button
          mat-button
          ngxButton
          surface="outline"
          type="button"
          [attr.aria-pressed]="section() === 'labs'"
          (click)="select('labs')"
        >
          Coding labs ({{ draft().labs.length }})
        </button>
        <button
          mat-button
          ngxButton
          surface="outline"
          type="button"
          [attr.aria-pressed]="section() === 'assessment'"
          (click)="select('assessment')"
        >
          Assessment ({{ draft().assessment.testQuestions.length }})
        </button>
      </div>
      <div
        class="review__workspace"
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
      max-width: 85ch;
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
      flex-wrap: wrap;
      gap: 0.5rem;
      margin: 1.5rem 0 1rem;
    }
    .review__tabs [aria-pressed='true'] {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: -2px;
    }
    .review__workspace {
      display: grid;
      grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
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
      .review__tabs {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `,
})
export class PublishingReviewComponent {
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
