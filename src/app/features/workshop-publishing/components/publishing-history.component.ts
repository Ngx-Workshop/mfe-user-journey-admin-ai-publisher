import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PublishingStatusComponent } from './publishing-status.component';
import type { HistoryFilter, HistoryRow } from '../models/history.models';

@Component({
  selector: 'ngx-publishing-history',
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, PublishingStatusComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="history" aria-labelledby="history-title" [attr.aria-busy]="busy()">
      <div class="history__heading">
        <div><h2 id="history-title">Request history</h2>
          <p>Search your latest 100 requests and check their publishing receipts.</p></div>
        <button mat-stroked-button type="button" [disabled]="busy()" (click)="refresh.emit()">Refresh history</button>
      </div>
      <div class="history__filters">
        <mat-form-field appearance="outline">
          <mat-label>Search requests</mat-label>
          <input matInput [value]="search()" (input)="searchChanged.emit(searchValue($event))"
            placeholder="Request ID, message or publishing step" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Request status</mat-label>
          <select matNativeControl [value]="status()" (change)="changeStatus($event)">
            <option value="all">All statuses</option>
            <option value="complete">Completed</option>
            <option value="running">Running</option>
            <option value="needs_recovery">Needs attention</option>
            <option value="unconfirmed">Unconfirmed</option>
          </select>
        </mat-form-field>
        <button mat-button type="button" (click)="clear.emit()" [disabled]="!search() && status() === 'all'">Clear filters</button>
      </div>
      @if (busy()) { <mat-progress-bar mode="indeterminate" aria-label="Loading publishing requests" /> }
      @if (error()) {
        <p class="history__error" role="alert">{{ error() }}
          <button mat-button type="button" [disabled]="busy()" (click)="refresh.emit()">Retry</button>
        </p>
      }
      <p class="history__count" role="status">{{ rows().length }} of {{ total() }} requests</p>
      @for (row of rows(); track row.requestId) {
        <article class="history__row">
          <div class="history__details">
            <ngx-publishing-status [status]="row.status" />
            <h3 class="history__id">{{ row.requestId }}</h3>
            @if (row.message) { <p>{{ row.message }}</p> }
            <p class="history__steps">{{ row.summary }}</p>
          </div>
          <button mat-stroked-button type="button" [disabled]="busy()"
            [attr.aria-label]="'Inspect receipt ' + row.requestId" (click)="inspect.emit(row.requestId)">Inspect receipt</button>
        </article>
      } @empty {
        @if (!busy() && !error()) {
          <div class="history__empty">
            <h3>{{ total() ? 'No matching requests' : 'No publishing requests yet' }}</h3>
            <p>{{ total() ? 'Try another search or clear your filters.' : 'Start a new workshop to create learning materials with AI.' }}</p>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .history { padding: 1.5rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 1rem; }
    .history__heading, .history__row { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
    .history__heading h2 { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .history__heading p, .history__steps, .history__count { color: var(--mat-sys-on-surface-variant); }
    .history__filters { display: grid; grid-template-columns: minmax(0, 1fr) 220px auto; gap: 1rem; align-items: start; margin-top: 1rem; }
    .history__row { border-top: 1px solid var(--mat-sys-outline-variant); padding: 1rem 0; }
    .history__details { min-width: 0; }
    .history__id { overflow-wrap: anywhere; font-size: 0.95rem; font-weight: 500; }
    .history__error { color: var(--mat-sys-error); }
    .history__empty { padding: 2rem 0; text-align: center; }
    @media (max-width: 700px) {
      .history { padding: 1rem; }
      .history__heading, .history__row { align-items: flex-start; flex-direction: column; }
      .history__filters { grid-template-columns: minmax(0, 1fr); gap: 0; }
    }
  `],
})
export class PublishingHistoryComponent {
  readonly rows = input.required<readonly HistoryRow[]>();
  readonly total = input(0);
  readonly search = input('');
  readonly status = input<HistoryFilter>('all');
  readonly busy = input(false);
  readonly error = input('');
  readonly searchChanged = output<string>();
  readonly statusChanged = output<HistoryFilter>();
  readonly clear = output<void>();
  readonly refresh = output<void>();
  readonly inspect = output<string>();
  searchValue(event: Event): string { return (event.target as HTMLInputElement).value; }
  changeStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'all' || value === 'complete' || value === 'running' || value === 'needs_recovery' || value === 'unconfirmed') {
      this.statusChanged.emit(value);
    }
  }
}
