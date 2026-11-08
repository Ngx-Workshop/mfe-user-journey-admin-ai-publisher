import { PreparationActivityComponent } from './preparation-activity.component';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  PreparationReport,
  PreparationRepairOptions,
} from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-preparation',
  host: {
    '[class.preparation--compact]': 'compact()',
    '[class.preparation--embedded]': 'embedded()',
  },
  imports: [MatButtonModule, NgxButton, PreparationActivityComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="preparation"
      aria-label="Authoring skills and checks"
      [attr.aria-busy]="report().status === 'running'"
    >
      <header class="preparation__header">
        @if (showHeading()) {
          <div>
            <p class="preparation__eyebrow">SKILLS AND CHECKS</p>
            <h2>{{ compact() ? 'Checks' : heading() }}</h2>
          </div>
        }
        <p
          class="preparation__summary"
          role="status"
          aria-live="polite"
        >
          {{ passed() }} passed · {{ failed() }} failed ·
          {{ active() }} running
        </p>
      </header>
      <p>
        {{
          report().message ||
            'Showing reported server activity. No workshop resources are created during preparation.'
        }}
      </p>
      @if (report().model; as model) {
        <p class="preparation__meta">
          Model: {{ model }} · Revisions: {{ report().repairCount }}/1
        </p>
      }
      <details
        class="preparation__log"
        [open]="
          compact() ||
          report().status === 'running' ||
          !report().ready
        "
      >
        <summary>
          Inspect skill and check activity ({{
            report().activities.length
          }}
          steps)
        </summary>
        <ol class="preparation__timeline">
          @for (activity of report().activities; track activity.id) {
            <li
              ngxPreparationActivity
              [activity]="activity"
              [compact]="compact()"
              [repairable]="repairableIds().has(activity.id)"
              [repairModel]="repairModel()"
              [locked]="locked()"
              (repair)="repair.emit($event)"
            ></li>
          } @empty {
            <li>Waiting for the first server update…</li>
          }
        </ol>
      </details>
      @if (hasRevisionHistory()) {
        <p class="preparation__meta">
          Earlier failures remain in the activity history. Readiness
          uses the final check attempt.
        </p>
      }
      <p class="preparation__meta">
        Preparation ID: {{ report().preparationId }}
      </p>
      @if (!locked() && report().status === 'running') {
        <button
          mat-button
          ngxButton
          surface="outline"
          type="button"
          (click)="resume.emit()"
        >
          Resume check progress
        </button>
      }
    </section>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      margin: 1.25rem 0;
    }
    :host(.preparation--embedded),
    :host(.preparation--compact) {
      margin: 0;
    }
    :host(.preparation--embedded) .preparation,
    :host(.preparation--compact) .preparation {
      border: 0;
      padding: 0;
    }
    :host(.preparation--embedded) .preparation {
      background: transparent;
    }
    :host(.preparation--compact) h2 {
      font-size: 1.05rem;
    }
    :host(.preparation--compact) .preparation__header {
      display: block;
    }
    :host(.preparation--compact) .preparation__timeline {
      margin: 0.75rem 0;
    }
    :host(.preparation--compact) p {
      line-height: 1.45;
    }
    .preparation {
      border: 1px solid var(--ngx-color-border);
      background: var(--ngx-color-surface);
      padding: clamp(1rem, 3vw, 2rem);
      overflow-wrap: anywhere;
    }
    .preparation__header {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.75rem;
    }
    h2 {
      margin: 0;
      font-size: 1.35rem;
    }
    p {
      line-height: 1.6;
    }
    .preparation__eyebrow {
      color: var(--ngx-color-primary);
      font: 0.7rem var(--ngx-font-mono);
      letter-spacing: 0.08em;
      margin-top: 0;
    }
    .preparation__meta {
      color: var(--ngx-color-muted);
      font-size: 0.8rem;
    }
    .preparation__timeline {
      list-style: none;
      padding: 0;
      margin: 1.5rem 0;
    }
    summary {
      cursor: pointer;
      line-height: 1.5;
    }
    summary:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: 3px;
    }
  `,
})
export class PublishingPreparationComponent {
  readonly report = input.required<PreparationReport>();
  readonly locked = input(false);
  readonly showHeading = input(true);
  readonly embedded = input(false);
  readonly compact = input(false);
  readonly resume = output<void>();
  readonly repair = output<string>();
  readonly repairOptions = input<PreparationRepairOptions | null>(
    null
  );
  readonly repairModel = input('');
  readonly repairableIds = computed(() => {
    const report = this.report();
    const options = this.repairOptions();
    return new Set(
      report.status === 'complete' &&
        !report.ready &&
        options?.preparationId === report.preparationId &&
        options.draftHash === report.draftHash
        ? options.activities.map((row) => row.activityId)
        : []
    );
  });
  readonly hasRevisionHistory = computed(() =>
    this.report().activities.some((row) =>
      row.id.startsWith('recheck-')
    )
  );
  readonly heading = computed(() =>
    this.report().status === 'running'
      ? 'Preparing your workshop'
      : this.report().ready
        ? 'Automated checks passed'
        : 'Checks need attention'
  );
  readonly latest = computed(() => {
    const rows = this.report().activities.filter(
      (row) => row.kind === 'check' || row.kind === 'review'
    );
    return rows.some((row) => row.id.startsWith('recheck-'))
      ? rows.filter((row) => row.id.startsWith('recheck-'))
      : rows;
  });
  readonly passed = computed(
    () =>
      this.latest().filter((row) => row.status === 'passed').length
  );
  readonly failed = computed(
    () =>
      this.latest().filter((row) => row.status === 'failed').length
  );
  readonly active = computed(
    () =>
      this.report().activities.filter(
        (row) => row.status === 'running'
      ).length
  );
}
