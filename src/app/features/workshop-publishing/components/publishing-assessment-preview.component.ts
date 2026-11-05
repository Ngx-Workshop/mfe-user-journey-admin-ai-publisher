import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
} from '@angular/core';
import { WorkshopDraft } from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-assessment-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="assessment" aria-label="Assessment preview">
      <p class="assessment__eyebrow">
        ASSESSMENT / {{ assessment().testQuestions.length }} QUESTIONS
      </p>
      <h3>{{ assessment().name }}</h3>
      <label class="assessment__toggle"
        ><input
          type="checkbox"
          [checked]="answers()"
          (change)="answers.set(!answers())"
        />
        Show answers and feedback</label
      >
      @for (
        question of assessment().testQuestions;
        track $index;
        let index = $index
      ) {
        <section class="assessment__question">
          <h4>
            <span class="assessment__number">{{ index + 1 }}.</span>
            {{ question.question }}
          </h4>
          <ol type="A" class="assessment__choices">
            @for (choice of question.choices; track $index) {
              <li>{{ choice.value }}</li>
            }
          </ol>
          @if (answers()) {
            <div class="assessment__answer">
              <p><strong>Answer:</strong> {{ question.answer }}</p>
              <p>
                <strong>Correct feedback:</strong>
                {{ question.correctResponse }}
              </p>
              <p>
                <strong>Incorrect feedback:</strong>
                {{ question.incorrectResponse }}
              </p>
            </div>
          }
        </section>
      } @empty {
        <p>No assessment questions in this draft.</p>
      }
    </article>
  `,
  styles: `
    .assessment {
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
    .assessment__eyebrow {
      color: var(--ngx-color-primary);
      font: 0.7rem var(--ngx-font-mono);
    }
    h3 {
      font-size: 1.5rem;
    }
    .assessment__toggle {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
    }
    input {
      accent-color: var(--ngx-color-primary);
      width: 1rem;
      height: 1rem;
    }
    .assessment__question {
      border-top: 1px solid var(--ngx-color-border);
      margin-top: 1.5rem;
      padding-top: 0.5rem;
    }
    .assessment__number {
      color: var(--ngx-color-primary);
    }
    .assessment__choices {
      padding-left: 2rem;
    }
    li {
      padding: 0.5rem;
    }
    .assessment__answer {
      background: var(--ngx-color-surface-high);
      border-left: 3px solid var(--ngx-color-primary);
      padding: 0.25rem 1rem;
    }
  `,
})
export class PublishingAssessmentPreviewComponent {
  readonly assessment = input.required<WorkshopDraft['assessment']>();
  readonly answers = signal(false);
  constructor() {
    effect(() => {
      this.assessment();
      this.answers.set(false);
    });
  }
}
