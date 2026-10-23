import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { HistoryStatus } from '../models/history.models';

@Component({
  selector: 'ngx-publishing-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="publishing-status" [class.publishing-status--complete]="status() === 'complete'"
      [class.publishing-status--running]="status() === 'running'"
      [class.publishing-status--attention]="status() === 'needs_recovery'">
      <span class="publishing-status__dot" aria-hidden="true"></span>{{ labels[status()] }}
    </span>
  `,
  styles: [`
    :host { display: inline-block; }
    .publishing-status {
      --status-accent: var(--mat-sys-outline);
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.35rem 0.75rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 600;
      border: 1px solid color-mix(in srgb, var(--status-accent) 45%, var(--mat-sys-surface));
      background: color-mix(in srgb, var(--status-accent) 14%, var(--mat-sys-surface));
      color: var(--mat-sys-on-surface);
    }
    .publishing-status--complete { --status-accent: #2e7d32; }
    .publishing-status--running { --status-accent: #1565c0; }
    .publishing-status--attention { --status-accent: var(--mat-sys-error); }
    .publishing-status__dot { width: 0.5rem; height: 0.5rem; border-radius: 50%; background: var(--status-accent); }
  `],
})
export class PublishingStatusComponent {
  readonly status = input.required<HistoryStatus>();
  readonly labels: Record<HistoryStatus, string> = {
    complete: 'Completed', running: 'Running', needs_recovery: 'Needs attention', unconfirmed: 'Unconfirmed',
  };
}
