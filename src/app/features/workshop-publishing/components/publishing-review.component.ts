import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { WorkshopDraft } from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-review',
  imports: [JsonPipe, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="review">
      <h3>{{ draft().name }}</h3>
      <p>{{ draft().summary }}</p>
      <p>{{ draft().pages.length }} document pages · {{ draft().labs.length }} coding labs ·
        {{ draft().assessment.testQuestions.length }} assessment questions</p>
      @for (page of draft().pages; track $index) {
        <details class="review__details">
          <summary class="review__summary">Documentation: {{ page.name }}</summary>
          @for (block of page.blocks; track block.blockId) {
            @if (block.componentInstanceName === 'ParagraphBlockComponent' ||
              block.componentInstanceName === 'HeaderBlockComponent' ||
              block.componentInstanceName === 'NgxEditorJs2PanelComponent' ||
              block.componentInstanceName === 'NgxEditorJs2BlockquotesComponent') {
              <div class="review__block" [innerHTML]="block.dataClean"></div>
            } @else {
              <pre class="review__code">{{ block.dataClean }}</pre>
            }
          }
        </details>
      }
      @for (lab of draft().labs; track $index) {
        <details class="review__details">
          <summary class="review__summary">Coding lab: {{ lab.metadata.title }}</summary>
          <pre class="review__code">{{ lab.version.promptMarkdown }}</pre>
          <h4>Starter code</h4>
          <pre class="review__code">{{ lab.version.starterCode }}</pre>
          <h4>Reference solution and tests</h4>
          <pre class="review__code">{{ lab.version | json }}</pre>
        </details>
      }
      <details class="review__details">
        <summary class="review__summary">Assessment: {{ draft().assessment.name }}</summary>
        @for (question of draft().assessment.testQuestions; track $index) {
          <h4>{{ question.question }}</h4>
          @for (choice of question.choices; track $index) { <p>{{ choice.value }}</p> }
          <p><strong>Answer:</strong> {{ question.answer }}</p>
          <p>{{ question.correctResponse }}</p>
          <p>{{ question.incorrectResponse }}</p>
        }
      </details>
      @if (showPublish()) {
      <p>Publishing makes these resources available immediately. Coding labs must pass verification first.</p>
      <button mat-flat-button type="button" [disabled]="locked()" (click)="publish.emit()">
        Publish reviewed workshop
      </button>
      }
    </article>
  `,
  styles: [`
    .review {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.5rem;
    }
    .review__details { margin: 0.75rem 0; }
    .review__summary { cursor: pointer; padding: 0.5rem; font-weight: 600; }
    .review__code {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      max-height: 32rem;
      overflow: auto;
      background: var(--mat-sys-surface-container);
      padding: 1rem;
    }
    .review__block { margin: 0.75rem; }
  `],
})
export class PublishingReviewComponent {
  readonly draft = input.required<WorkshopDraft>();
  readonly locked = input(false);
  readonly showPublish = input(true);
  readonly publish = output<void>();
}
