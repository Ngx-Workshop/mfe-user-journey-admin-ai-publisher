import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PublishingReceipt } from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-receipts',
  imports: [JsonPipe, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="receipts" aria-label="Publishing requests and receipts">
      @if (showHistory()) {
      <details class="receipts__panel">
        <summary class="receipts__summary">Publishing request history</summary>
        <button class="receipts__button" mat-stroked-button type="button"
          [disabled]="busy() || initializing()" (click)="refresh.emit()">Refresh history</button>
        @for (run of history(); track run.requestId) {
          <p class="receipts__request">
            <code>{{ run.requestId }}</code> — {{ run.status }}
            <button class="receipts__button" mat-button type="button" [disabled]="busy()"
              (click)="inspectHistory.emit(run.requestId)">Inspect receipt</button>
          </p>
        }
        @for (id of unconfirmed(); track id) {
          <p class="receipts__request">
            <code>{{ id }}</code> — Receipt unconfirmed
            <button class="receipts__button" mat-button type="button" [disabled]="busy()"
              (click)="inspectHistory.emit(id)">Inspect receipt</button>
          </p>
        }
        @if (!history().length && !unconfirmed().length) { <p>No publishing requests found.</p> }
      </details>
      }
      <p class="receipts__request">Publishing request ID: <code>{{ requestId() }}</code></p>
      @if (attempted()) {
        <p>Keep this ID. Check its receipt if the connection fails before starting another workshop.</p>
      }
      <mat-form-field class="receipts__field" appearance="outline">
        <mat-label>Receipt request ID (optional)</mat-label>
        <input matInput [formControl]="receiptId()" placeholder="Leave blank to check this workshop" />
      </mat-form-field>
      <button class="receipts__button" mat-stroked-button type="button"
        [disabled]="busy()" (click)="inspect.emit()">Check publishing receipt</button>
      @if (receipt(); as current) {
        <div class="receipts__panel" role="status">
          <h3>{{ current.status === 'complete' ? 'Workshop published' :
            current.status === 'running' ? 'Publishing in progress' : 'Publishing needs attention' }}</h3>
          <p class="receipts__request">Request ID: <code>{{ current.requestId }}</code></p>
          <p>{{ current.message }}</p>
          @for (step of current.steps; track $index) {
            <details>
              <summary class="receipts__summary">{{ step.name }} — {{ step.status }}</summary>
              <pre class="receipts__code">{{ step.result | json }}</pre>
            </details>
          }
        </div>
      }
    </section>
  `,
  styles: [`
    .receipts__panel {
      margin-top: 1.5rem;
      padding: 1rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 0.5rem;
    }
    .receipts__summary { cursor: pointer; padding: 0.5rem; font-weight: 600; }
    .receipts__request { overflow-wrap: anywhere; }
    .receipts__field { width: 100%; }
    .receipts__button { margin: 0.5rem 0.5rem 0.5rem 0; }
    .receipts__code {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      max-height: 32rem;
      overflow: auto;
      background: var(--mat-sys-surface-container);
      padding: 1rem;
    }
  `],
})
export class PublishingReceiptsComponent {
  readonly showHistory = input(true);
  readonly history = input.required<readonly PublishingReceipt[]>();
  readonly unconfirmed = input.required<readonly string[]>();
  readonly requestId = input.required<string>();
  readonly receiptId = input.required<FormControl<string>>();
  readonly receipt = input<PublishingReceipt | null>(null);
  readonly busy = input(false);
  readonly initializing = input(false);
  readonly attempted = input(false);
  readonly refresh = output<void>();
  readonly inspect = output<void>();
  readonly inspectHistory = output<string>();
}
