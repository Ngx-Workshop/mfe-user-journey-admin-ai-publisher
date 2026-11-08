import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import {
  NgxInlineStatus,
  NgxInlineStatusTone,
} from '@tmdjr/ngx-workshop-design-system';
import type { HistoryStatus } from '../models/history.models';

@Component({
  selector: 'ngx-publishing-status',
  imports: [NgxInlineStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ngx-inline-status
    [label]="labels[status()]"
    [tone]="tones[status()]"
  />`,
  styles: [
    `
      :host {
        display: inline-block;
      }
    `,
  ],
})
export class PublishingStatusComponent {
  readonly status = input.required<HistoryStatus>();
  readonly labels: Record<HistoryStatus, string> = {
    draft: 'Draft',
    complete: 'Completed',
    running: 'Running',
    needs_recovery: 'Recovery',
    unconfirmed: 'Unconfirmed',
  };
  readonly tones: Record<HistoryStatus, NgxInlineStatusTone> = {
    draft: 'warning',
    complete: 'success',
    running: 'info',
    needs_recovery: 'error',
    unconfirmed: 'neutral',
  };
}
