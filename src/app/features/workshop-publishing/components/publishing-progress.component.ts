import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  PublishingOperation,
  publishingOperationLabels,
} from '../models/publishing-operation';

@Component({
  selector: 'ngx-publishing-progress',
  imports: [MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="progress"
      aria-label="Current publishing activity"
      [attr.aria-busy]="true"
    >
      <div class="progress__heading">
        <div>
          <p class="progress__eyebrow">
            {{
              generating() ? 'DRAFT GENERATION' : 'CURRENT ACTIVITY'
            }}
          </p>
          <h2 role="status" aria-live="polite">
            {{ labels[operation()] }}
          </h2>
        </div>
        <span class="progress__elapsed" aria-label="Elapsed time"
          >{{ time() }} elapsed</span
        >
      </div>
      <p>{{ description() }}</p>
      <mat-progress-bar
        mode="indeterminate"
        [attr.aria-label]="labels[operation()]"
      />
      @if (generating()) {
        <p class="progress__note">
          You can review everything before publishing. Nothing has
          been published.
        </p>
        @if (elapsed() >= 60) {
          <p role="status">
            Preparation is still running. Follow the reported skills and
            checks below; keep this page open.
          </p>
        }
      }
    </section>
  `,
  styles: `
    .progress {
      padding: clamp(1rem, 3vw, 2rem);
      border: 1px solid var(--ngx-color-border);
      background: var(--ngx-color-surface);
    }
    .progress__heading {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem;
    }
    h2 {
      margin: 0;
      font-size: 1.35rem;
    }
    p,
    small {
      color: var(--ngx-color-muted);
      line-height: 1.6;
    }
    .progress__eyebrow {
      margin-top: 0;
      font: 0.7rem var(--ngx-font-mono);
      letter-spacing: 0.1em;
      color: var(--ngx-color-primary);
    }
    .progress__elapsed {
      font: 0.8rem var(--ngx-font-mono);
      color: var(--ngx-color-muted);
    }
    .progress__stages {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0 0;
    }
    li {
      display: grid;
      grid-template-columns: 2rem minmax(0, 1fr) auto;
      align-items: start;
      gap: 0.75rem;
      padding: 1rem 0;
      border-bottom: 1px solid var(--ngx-color-border);
    }
    li > span:last-child {
      font-size: 0.75rem;
      color: var(--ngx-color-muted);
    }
    small {
      display: block;
      margin-top: 0.3rem;
    }
    .progress__marker {
      color: var(--ngx-color-primary);
      font-family: var(--ngx-font-mono);
    }
    .progress__active strong {
      color: var(--ngx-color-primary);
    }
    .progress__note {
      margin-bottom: 0;
    }
    @media (max-width: 600px) {
      li {
        grid-template-columns: 1.5rem minmax(0, 1fr);
      }
      li > span:last-child {
        grid-column: 2;
      }
    }
  `,
})
export class PublishingProgressComponent {
  readonly operation = input.required<PublishingOperation>();
  readonly elapsed = input(0);
  readonly labels = publishingOperationLabels;
  readonly generating = computed(
    () => this.operation() === 'generate'
  );
  readonly time = computed(
    () =>
      `${Math.floor(this.elapsed() / 60)}:${String(this.elapsed() % 60).padStart(2, '0')}`
  );
  readonly description = computed(() => {
    switch (this.operation()) {
      case 'generate':
        return 'Authoring, checks and any bounded revision run on the server. This may take a few minutes.';
      case 'validate':
        return 'Checking the draft, objective coverage and isolated lab execution before review.';
      case 'image':
        return 'Creating your illustration and saving it to image assets. Your workshop draft is preserved.';
      case 'publish':
        return 'Submitting the reviewed materials for verification and publication. Keep this page open; the receipt will confirm the outcome.';
      case 'receipt':
        return 'Retrieving the latest confirmed publication results for this request.';
      default:
        return 'Preparing your workspace. Your current inputs are preserved.';
    }
  });
}
