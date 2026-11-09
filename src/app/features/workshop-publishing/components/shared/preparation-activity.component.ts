import { MatButtonModule } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { PreparationActivity } from '../../models/publishing.models';

@Component({
  selector: 'li[ngxPreparationActivity]',
  host: {
    class: 'activity',
    '[class.activity--compact]': 'compact()',
    '[attr.data-status]': 'activity().status',
  },
  imports: [MatButtonModule, NgxButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="activity__marker" aria-hidden="true">{{
      marker()
    }}</span>
    <details
      class="activity__details"
      [open]="
        activity().status === 'failed' ||
        activity().status === 'running'
      "
    >
      <summary>
        <strong>{{ activity().label }}</strong>
        <span class="activity__status">{{ status() }}</span>
      </summary>
      @if (activity().skillVersion) {
        <p class="activity__meta">
          Skill version {{ activity().skillVersion }}
        </p>
      }
      <p class="activity__evidence">
        {{ activity().detail || 'Waiting for the result…' }}
      </p>
      @if (repairable()) {
        <p class="activity__meta">
          Uses {{ repairModel() }} to revise the draft and rerun all
          checks. Model charges may apply. Review changes before
          publishing.
        </p>
        <button
          mat-button
          ngxButton
          surface="outline"
          type="button"
          [disabled]="locked() || !repairModel()"
          [attr.aria-label]="'Fix ' + activity().label + ' with AI'"
          (click)="repair.emit(activity().id)"
        >
          Fix with AI
        </button>
      }
      @if (activity().startedAt) {
        <p class="activity__meta">{{ duration() }}</p>
      }
      @if (activity().skillHash) {
        <p class="activity__hash">
          Content fingerprint: {{ activity().skillHash }}
        </p>
      }
    </details>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: 1.5rem minmax(0, 1fr);
      gap: 0.75rem;
      border-top: 1px solid var(--ngx-color-border);
      padding: 0.85rem 0;
      overflow-wrap: anywhere;
    }
    :host(.activity--compact) {
      grid-template-columns: 1rem minmax(0, 1fr);
      gap: 0.35rem;
      padding: 0.55rem 0;
      font-size: 0.78rem;
    }
    :host(.activity--compact) .activity__status {
      display: block;
      margin-left: 0;
      font-size: 0.72rem;
    }
    :host(.activity--compact) p {
      margin: 0.4rem 0;
      line-height: 1.4;
      font-size: 0.75rem;
    }
    .activity__marker {
      color: var(--ngx-color-primary);
    }
    :host([data-status='failed']) .activity__marker {
      color: var(--ngx-color-error);
    }
    :host([data-status='passed']) .activity__marker {
      color: var(--ngx-color-success, var(--ngx-color-primary));
    }
    .activity__details {
      min-width: 0;
    }
    .activity__meta,
    .activity__hash,
    .activity__status {
      color: var(--ngx-color-muted);
      font-size: 0.8rem;
    }
    .activity__hash {
      font-family: var(--ngx-font-mono);
    }
    p {
      line-height: 1.6;
    }
    summary {
      cursor: pointer;
      line-height: 1.5;
    }
    summary:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: 3px;
    }
    .activity__status {
      display: inline-block;
      margin-left: 0.5rem;
    }
    .activity__evidence {
      white-space: pre-wrap;
      margin-bottom: 0.5rem;
    }
    @media (max-width: 600px) {
      .activity__status {
        display: block;
        margin-left: 0;
      }
    }
  `,
})
export class PreparationActivityComponent {
  readonly compact = input(false);
  readonly repairable = input(false);
  readonly repairModel = input('');
  readonly locked = input(false);
  readonly repair = output<string>();
  readonly activity = input.required<PreparationActivity>();
  readonly status = computed(() => {
    const row = this.activity();
    if (row.kind === 'skill' && row.status === 'passed')
      return 'Supplied to model';
    return {
      pending: 'Pending',
      running: 'Running',
      passed: 'Passed',
      failed: 'Failed',
      skipped: 'Not applied',
      review_required: 'Your review required',
    }[row.status];
  });
  readonly marker = computed(
    () =>
      ({
        pending: '○',
        running: '◌',
        passed: '✓',
        failed: '!',
        skipped: '—',
        review_required: '?',
      })[this.activity().status]
  );
  readonly duration = computed(() => {
    const row = this.activity();
    if (!row.finishedAt) return 'Started; awaiting result';
    const seconds = Math.max(
      0,
      (Date.parse(row.finishedAt) - Date.parse(row.startedAt!)) / 1000
    );
    return `Completed in ${seconds.toFixed(1)}s`;
  });
}
