import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  model,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { previewBlock } from '../../utils/publishing-preview';
import { WorkshopDraft } from '../../models/publishing.models';
import { PublishingReviewOutlineComponent } from './publishing-review-outline.component';
import { PublishingDocumentPreviewComponent } from './publishing-document-preview.component';
import { PublishingLabPreviewComponent } from './publishing-lab-preview.component';
import { PublishingAssessmentPreviewComponent } from './publishing-assessment-preview.component';

import {
  PreviewSection,
  PublishingReviewTabsComponent,
} from './publishing-review-tabs.component';

@Component({
  selector: 'ngx-publishing-review',
  imports: [
    PublishingReviewTabsComponent,
    PublishingReviewOutlineComponent,
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
          @if (showIdentity()) {
            <p class="review__eyebrow">
              WORKSHOP PREVIEW / LEVEL {{ draft().level }}
            </p>
            <h2>{{ draft().name }}</h2>
          }
          <p class="review__summary">{{ draft().summary }}</p>
          <p class="review__note">
            Explore the materials below before approving publication.
            This is an unpublished draft.
          </p>
        </div>
      </header>
      @if (showTabs()) {
        <ngx-publishing-review-tabs
          [draft]="draft()"
          [panelId]="panelId()"
          [section]="section()"
          (sectionChange)="select($event)"
        />
      }
      <div
        class="review__workspace"
        role="tabpanel"
        [id]="panelId()"
        [attr.aria-labelledby]="tabId(section())"
        [class.review__workspace--assessment]="
          section() === 'assessment' || !showOutline()
        "
      >
        @if (showOutline() && section() !== 'assessment') {
          <ngx-publishing-review-outline
            [draft]="draft()"
            [section]="section()"
            [(selected)]="selected"
          />
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
              [selectedQuestion]="showOutline() ? null : selected()"
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
      margin-bottom: 1.5rem;
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
      font-size: 0.8rem;
      overflow: hidden;
    }
    .review__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .review__info {
      min-width: 0;
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
    .review__workspace {
      display: grid;
      grid-template-columns: minmax(150px, 190px) minmax(0, 1fr);
      border: 1px solid var(--ngx-color-border);
    }
    .review__workspace--assessment {
      grid-template-columns: minmax(0, 1fr);
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
      .review__header {
        grid-template-columns: minmax(0, 1fr);
      }
      .review__image {
        max-width: 320px;
        width: 100%;
      }
    }
  `,
})
export class PublishingReviewComponent {
  private static nextId = 0;
  readonly panelId = input(
    `workshop-material-${PublishingReviewComponent.nextId++}`
  );
  readonly image = computed(() =>
    this.draft()
      .pages.flatMap((page) =>
        [...page.blocks]
          .sort((a, b) => a.sortIndex - b.sortIndex)
          .map(previewBlock)
      )
      .find((block) => block.kind === 'image')
  );
  tabId(section: PreviewSection): string {
    return `${this.panelId()}-${section}`;
  }
  readonly draft = input.required<WorkshopDraft>();
  readonly locked = input(false);
  readonly showPublish = input(true);
  readonly publish = output<void>();
  readonly section = model<PreviewSection>('pages');
  readonly showTabs = input(true);
  readonly showIdentity = input(true);
  readonly selected = model(0);
  readonly showOutline = input(true);

  constructor() {
    let previousDraft: WorkshopDraft | undefined;
    effect(() => {
      const draft = this.draft();
      if (previousDraft && previousDraft !== draft)
        this.select('pages');
      previousDraft = draft;
    });
    let previousSection: PreviewSection | undefined;
    effect(() => {
      const section = this.section();
      if (previousSection && previousSection !== section)
        this.selected.set(0);
      previousSection = section;
    });
  }
  select(section: PreviewSection): void {
    this.section.set(section);
    this.selected.set(0);
  }
}
