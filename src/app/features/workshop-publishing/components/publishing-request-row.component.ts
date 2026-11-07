import { DatePipe } from '@angular/common';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
} from '@angular/core';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import type { HistoryRow } from '../models/history.models';
import { PublishingStatusComponent } from './publishing-status.component';

@Component({
  selector: 'ngx-publishing-request-row',
  imports: [
    DatePipe,
    NgxButton,
    ClipboardModule,
    MatButtonModule,
    MatIconModule,
    PublishingStatusComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="history__row">
      <div class="request-row__labels">
        <button
          class="request-row__open"
          type="button"
          [disabled]="busy()"
          [attr.aria-label]="
            row().draftId
              ? 'Continue review of ' + row().workshopName
              : 'Inspect receipt ' + row().requestId
          "
          [title]="
            row().draftId ? 'Continue review' : 'Inspect receipt'
          "
          (click)="open()"
        >
          <span
            class="request-row__name"
            [title]="
              row().workshopName ?? 'Workshop name unavailable'
            "
          >
            {{ row().workshopName ?? 'Workshop name unavailable' }}
          </span>
        </button>
        <button
          class="request-row__id"
          type="button"
          [cdkCopyToClipboard]="row().requestId"
          (cdkCopyToClipboardCopied)="copied.set($event)"
          [attr.aria-label]="
            (row().draftId ? 'Copy draft ID ' : 'Copy request ID ') +
            row().requestId
          "
          [title]="
            row().draftId ? 'Copy draft ID' : 'Copy request ID'
          "
        >
          <span>{{ row().requestId }}</span
          ><mat-icon aria-hidden="true">content_copy</mat-icon>
        </button>
        <p
          class="request-row__summary"
          [title]="
            row().summary +
            (row().message ? ' · ' + row().message : '')
          "
        >
          {{ row().summary }}
          @if (row().updatedAt) {
            · Saved {{ row().updatedAt | date: 'short' }}
          }
          @if (row().message) {
            · {{ row().message }}
          }
        </p>
        <span class="request-row__announcement" role="status">{{
          copied()
            ? row().draftId
              ? 'Draft ID copied'
              : 'Request ID copied'
            : ''
        }}</span>
      </div>
      <ngx-publishing-status [status]="row().status" />
      @if (row().draftId; as id) {
        <button
          mat-button
          ngxButton
          surface="glass"
          class="request-row__continue"
          type="button"
          [disabled]="busy()"
          (click)="resume.emit(id)"
        >
          Continue review
        </button>
      } @else if (row().workshopUrl; as url) {
        <a
          mat-icon-button
          class="request-row__launch"
          [href]="url"
          target="_blank"
          rel="noopener noreferrer"
          [attr.aria-label]="
            'Open workshop ' +
            (row().workshopName ?? row().requestId) +
            ' in a new tab'
          "
          title="Open workshop in a new tab"
          ><mat-icon aria-hidden="true">open_in_new</mat-icon></a
        >
      } @else {
        <button
          mat-icon-button
          class="request-row__launch"
          type="button"
          disabled
          aria-label="Workshop link unavailable"
          title="Workshop link unavailable until the first step completes"
        >
          <mat-icon aria-hidden="true">open_in_new</mat-icon>
        </button>
      }
    </article>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        display: block;
        min-width: 0;
        background: var(--ngx-color-surface-low);
        @include mat.icon-button-density(-3);
      }
      .history__row {
        position: relative;
        display: grid;
        grid-template-columns: minmax(0, 1fr) auto auto;
        align-items: center;
        gap: 0.5rem;
        min-height: 68px;
        padding: 6px 8px;
        border-bottom: 1px solid var(--ngx-color-border);
      }
      .history__row:hover,
      .history__row:focus-within {
        background: var(--ngx-color-surface);
      }
      .request-row__labels {
        min-width: 0;
      }
      .request-row__open,
      .request-row__id {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        text-align: left;
        cursor: pointer;
      }
      .request-row__open {
        color: var(--ngx-color-text);
        font: 600 0.75rem/1.5 var(--ngx-font-mono);
      }
      .request-row__open::after {
        content: '';
        position: absolute;
        inset: 0;
      }
      .request-row__open:disabled {
        cursor: default;
        opacity: 0.5;
      }
      .request-row__open:disabled::after {
        pointer-events: none;
      }
      .request-row__open:focus-visible {
        outline: none;
      }
      .request-row__open:focus-visible::after {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: -2px;
      }
      .request-row__name,
      .request-row__id span,
      .request-row__summary {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .request-row__id {
        position: relative;
        z-index: 1;
        width: fit-content;
        max-width: 100%;
        gap: 4px;
        color: var(--ngx-color-primary);
        font: 500 0.65rem/1.5 var(--ngx-font-mono);
      }
      .request-row__id mat-icon {
        flex-shrink: 0;
        width: 12px;
        height: 12px;
        font-size: 12px;
      }
      .request-row__id:hover {
        text-decoration: underline;
      }
      .request-row__id:focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: 2px;
      }
      .request-row__summary {
        margin: 0;
        color: var(--ngx-color-muted);
        font-size: 0.7rem;
        line-height: 1.6;
      }
      .request-row__continue {
        position: relative;
        z-index: 1;
        font-size: 0.7rem;
      }
      @media (max-width: 600px) {
        .request-row__continue {
          grid-column: 1 / -1;
          justify-self: start;
        }
      }
      .request-row__launch {
        position: relative;
        z-index: 1;
        color: var(--ngx-color-primary);
      }
      .request-row__announcement {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
    `,
  ],
})
export class PublishingRequestRowComponent {
  readonly row = input.required<HistoryRow>();
  readonly busy = input(false);
  readonly inspect = output<string>();
  readonly copied = signal(false);
  readonly resume = output<string>();
  open(): void {
    const row = this.row();
    if (row.draftId) this.resume.emit(row.draftId);
    else this.inspect.emit(row.requestId);
  }
}
