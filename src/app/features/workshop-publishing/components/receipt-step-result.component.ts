import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import {
  NgxCodeBlock,
  NgxInlineStatus,
} from '@tmdjr/ngx-workshop-design-system';
import { PublishingReceipt } from '../models/publishing.models';
import { LabVerification } from '../utils/publishing-verification';

export type ReceiptStepResult = PublishingReceipt['steps'][number] & {
  label: string;
  verification: LabVerification | null;
  labEditorUrl: string | null;
  documentEditorUrl: string | null;
};

@Component({
  selector: 'ngx-receipt-step-result',
  imports: [JsonPipe, NgxCodeBlock, NgxInlineStatus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-result__heading">
      <h2>{{ step().label }}</h2>
      <ngx-inline-status
        [label]="
          step().status === 'complete' ? 'Completed' : 'Pending'
        "
        [tone]="step().status === 'complete' ? 'success' : 'neutral'"
      />
      @if (step().verification; as verification) {
        <ngx-inline-status
          [label]="
            verification.passed
              ? 'Verification passed'
              : 'Verification failed'
          "
          [tone]="verification.passed ? 'success' : 'error'"
        />
      }
    </div>
    @if (step().verification; as verification) {
      <section
        class="step-result__verification"
        [class.step-result__verification--failed]="
          !verification.passed
        "
        aria-label="Coding lab verification outcome"
      >
        <h3>
          {{
            verification.passed
              ? 'Coding lab verification passed'
              : 'Coding lab needs attention'
          }}
        </h3>
        @if (verification.totalTests !== null) {
          <p>
            {{ verification.passedTests }} of
            {{ verification.totalTests }} tests passed.
          </p>
        }
        @if (!verification.passed) {
          <p>
            The verification operation completed, but the coding lab
            did not pass its tests.
          </p>
          <p>
            Review the tests and reference solution in the coding labs
            editor, fix the lab and run verification again.
          </p>
        }
      </section>
    }
    @if (
      step().status === 'complete' && step().labEditorUrl;
      as url
    ) {
      <a
        class="step-result__editor"
        [href]="url"
        target="_blank"
        rel="noopener noreferrer"
        >Open coding lab editor ↗</a
      >
    } @else if (step().verification) {
      <p class="step-result__note">
        The receipt does not include a usable coding lab ID. Find the
        lab in the coding labs editor to inspect it.
      </p>
    }
    @if (
      step().status === 'complete' && step().documentEditorUrl;
      as url
    ) {
      <a
        class="step-result__editor"
        [href]="url"
        target="_blank"
        rel="noopener noreferrer"
        >Open documentation editor ↗</a
      >
    }
    @if (step().result !== undefined) {
      <div class="step-result__code">
        <ngx-code-block
          [code]="(step().result | json) ?? ''"
          language="json"
          [label]="step().label + ' result'"
          [wrap]="true"
        />
      </div>
    } @else {
      <p class="step-result__note">
        No result reported for this step.
      </p>
    }
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .step-result__heading {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    h2 {
      margin: 0;
      font: 600 0.8rem/1.5 var(--ngx-font-mono);
      color: var(--ngx-color-text);
      overflow-wrap: anywhere;
    }
    .step-result__verification {
      border-left: 3px solid var(--ngx-color-success);
      padding: 0.75rem 1rem;
      background: var(--ngx-color-surface);
      margin-bottom: 1rem;
    }
    .step-result__verification--failed {
      border-color: var(--ngx-color-error);
    }
    h3 {
      margin: 0;
      color: var(--ngx-color-text);
      font-size: 0.95rem;
    }
    p {
      line-height: 1.6;
      overflow-wrap: anywhere;
    }
    .step-result__editor {
      display: inline-block;
      margin-bottom: 1rem;
      color: var(--ngx-color-primary);
      text-decoration: underline;
      text-underline-offset: 0.2em;
      overflow-wrap: anywhere;
    }
    .step-result__editor:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: 3px;
    }
    .step-result__code {
      position: relative;
      min-width: 0;
    }
    .step-result__note {
      font-size: 0.8rem;
      color: var(--ngx-color-muted);
    }
  `,
})
export class ReceiptStepResultComponent {
  readonly step = input.required<ReceiptStepResult>();
}
