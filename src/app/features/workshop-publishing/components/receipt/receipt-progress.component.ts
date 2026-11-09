import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import { ReceiptStepResult } from './receipt-step-result.component';

@Component({
  selector: 'ngx-receipt-progress',
  imports: [MatIconModule, NgxInlineStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="receipt__steps" role="list">
      @for (step of steps(); track $index) {
        <li class="receipt__step">
          <button
            class="receipt__step-button"
            type="button"
            [title]="step.label"
            [attr.aria-pressed]="selected() === $index"
            (click)="selectStep.emit($index)"
          >
            <span class="receipt__step-number">{{ $index + 1 }}</span>
            <span class="receipt__step-label">
              {{ step.label }}
              @if (step.verification; as verification) {
                <small
                  class="receipt__verification-label"
                  [class.receipt__verification-label--failed]="
                    !verification.passed
                  "
                >
                  {{
                    verification.passed
                      ? 'Verification passed'
                      : 'Verification failed'
                  }}
                </small>
              }
            </span>
            <ngx-inline-status
              [label]="
                step.status === 'complete' ? 'Completed' : 'Pending'
              "
              [tone]="
                step.status === 'complete' ? 'success' : 'neutral'
              "
            />
            <mat-icon aria-hidden="true">chevron_right</mat-icon>
          </button>
        </li>
      } @empty {
        <li class="receipt__empty">
          {{
            busy()
              ? 'Loading publishing steps…'
              : 'No publishing steps reported yet.'
          }}
        </li>
      }
    </ol>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .receipt__steps {
      list-style: none;
      padding: 0;
      margin: 0;
      border: 1px solid var(--ngx-color-border);
    }
    .receipt__step {
      background: var(--ngx-color-surface-low);
      border-bottom: 1px solid var(--ngx-color-border);
    }
    .receipt__step-button {
      display: grid;
      grid-template-columns: 1rem minmax(0, 1fr) auto 16px;
      gap: 6px;
      align-items: center;
      box-sizing: border-box;
      width: 100%;
      min-height: 48px;
      padding: 6px 8px;
      border: 0;
      background: transparent;
      color: var(--ngx-color-text);
      text-align: left;
      cursor: pointer;
      font: 500 0.7rem/1.5 var(--ngx-font-mono);
    }
    .receipt__step-button:hover,
    .receipt__step-button[aria-pressed='true'] {
      background: var(--ngx-color-surface-high);
    }
    .receipt__step-button[aria-pressed='true'] {
      box-shadow: inset 3px 0 var(--ngx-color-primary);
    }
    .receipt__step-button:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: -2px;
    }
    .receipt__step-number {
      color: var(--ngx-color-muted);
    }
    .receipt__step-label {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    .receipt__step-button mat-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      color: var(--ngx-color-primary);
    }
    .receipt__verification-label {
      display: block;
      font-size: 0.65rem;
      color: var(--ngx-color-success);
    }
    .receipt__verification-label--failed {
      color: var(--ngx-color-error);
    }
    .receipt__empty {
      padding: 8px;
      font-size: 0.75rem;
    }
  `,
})
export class ReceiptProgressComponent {
  readonly steps = input<ReceiptStepResult[]>([]);
  readonly selected = input(0);
  readonly busy = input(false);
  readonly selectStep = output<number>();
}
