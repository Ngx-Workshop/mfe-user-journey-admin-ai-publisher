import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PublishingReceipt } from '../../models/publishing.models';
import { PublishingPreparationComponent } from '../shared/publishing-preparation.component';
import { PublishingStatusComponent } from '../shared/publishing-status.component';
import { ReceiptStepResult } from './receipt-step-result.component';

@Component({
  selector: 'ngx-receipt-summary',
  imports: [
    MatButtonModule,
    MatProgressBarModule,
    PublishingPreparationComponent,
    PublishingStatusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="receipt__summary">
      @if (receipt(); as receipt) {
        <ngx-publishing-status [status]="receipt.status" />
      }
      <h2>Request ID</h2>
      <p class="receipt__id">{{ requestId() }}</p>
      @if (busy()) {
        <mat-progress-bar
          mode="indeterminate"
          aria-label="Loading publishing receipt"
        />
        <p role="status">Loading receipt…</p>
      }
      @if (error()) {
        <div class="receipt__error" role="alert">
          {{ error() }}
          @if (!invalid()) {
            <button
              mat-button
              type="button"
              [disabled]="busy()"
              (click)="refresh.emit()"
            >
              Retry
            </button>
          }
        </div>
      }
      @if (receipt(); as receipt) {
        <h2>Progress</h2>
        <p>{{ progress() }}</p>
        @if (failedVerifications().length) {
          <div class="receipt__verification-warning" role="status">
            <h2>Coding lab verification failed</h2>
            <p>
              Completed steps count finished operations, not passing
              tests. Review the failed verification results and fix
              the coding lab before continuing.
            </p>
            @for (
              failed of failedVerifications();
              track failed.name
            ) {
              @if (failed.labEditorUrl; as url) {
                <a
                  [href]="url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open {{ failed.label }} in coding lab editor ↗
                </a>
              }
            }
          </div>
        }
        @if (receipt.message) {
          <h2>Message</h2>
          <p>{{ receipt.message }}</p>
        }
        @if (receipt.status === 'needs_recovery') {
          <p class="receipt__recovery">
            Keep this request ID and check its receipt before starting
            another publish attempt.
          </p>
        }
        @if (receipt.preparation; as preparation) {
          <ngx-publishing-preparation
            [report]="preparation"
            [embedded]="true"
            [locked]="true"
          />
        }
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .receipt__summary {
      font-size: 0.75rem;
      line-height: 1.6;
    }
    .receipt__summary h2 {
      margin: 1rem 0 0.25rem;
      color: var(--ngx-color-text);
      font: 600 0.7rem/1.5 var(--ngx-font-mono);
    }
    .receipt__summary p {
      margin: 0.25rem 0 0.75rem;
      overflow-wrap: anywhere;
    }
    .receipt__id {
      font: 600 0.75rem/1.5 var(--ngx-font-mono);
      color: var(--ngx-color-text);
    }
    .receipt__recovery {
      color: var(--ngx-color-warning);
    }
    .receipt__error {
      color: var(--ngx-color-error);
    }
    .receipt__verification-warning {
      border-left: 2px solid var(--ngx-color-error);
      padding-left: 0.75rem;
    }
    .receipt__verification-warning a {
      display: block;
      color: var(--ngx-color-primary);
      margin-block: 0.75rem;
    }
  `,
})
export class ReceiptSummaryComponent {
  readonly requestId = input.required<string>();
  readonly receipt = input<PublishingReceipt | null>(null);
  readonly busy = input(false);
  readonly invalid = input(false);
  readonly error = input('');
  readonly progress = input('');
  readonly failedVerifications = input<ReceiptStepResult[]>([]);
  readonly refresh = output<void>();
}
