import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { PublishingFiltersComponent } from './publishing-filters.component';
import { PublishingRequestPanelComponent } from './publishing-request-panel.component';
import type {
  HistoryFilter,
  HistoryRow,
} from '../models/history.models';
import { observeWorkspaceHeight } from '../utils/panel-body-viewport';

@Component({
  selector: 'ngx-publishing-history',
  imports: [
    MatButtonModule,
    PublishingFiltersComponent,
    PublishingRequestPanelComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #workspace
      class="history-layout"
      [style.height.px]="workspaceHeight()"
    >
      <ngx-publishing-filters
        [rows]="allRows()"
        [search]="search()"
        [status]="status()"
        (searchChanged)="searchChanged.emit($event)"
        (statusChanged)="changeStatus($event)"
        (clear)="selectedPane.set(null); clear.emit()"
      />
      <div
        class="request-workspace"
        [class.request-workspace--issues]="hasIssues()"
      >
        @if (hasIssues()) {
          <div
            class="request-workspace__switch"
            role="group"
            aria-label="Receipt panels"
          >
            <button
              mat-button
              type="button"
              [attr.aria-pressed]="activePane() === 'requests'"
              (click)="selectedPane.set('requests')"
            >
              Requests ({{ requests().length }})
            </button>
            <button
              mat-button
              type="button"
              [attr.aria-pressed]="activePane() === 'issues'"
              (click)="selectedPane.set('issues')"
            >
              Issues ({{ issues().length }})
            </button>
          </div>
        }
        <ngx-publishing-request-panel
          class="request-workspace__main"
          [class.request-workspace__panel--hidden]="
            hasIssues() && activePane() !== 'requests'
          "
          [rows]="requests()"
          [busy]="busy()"
          [error]="error()"
          [emptyTitle]="emptyTitle()"
          [emptyDescription]="emptyDescription()"
          (refresh)="refresh.emit()"
          (inspect)="inspect.emit($event)"
        />
        @if (hasIssues()) {
          <ngx-publishing-request-panel
            class="request-workspace__issues"
            [issues]="true"
            [class.request-workspace__panel--hidden]="
              activePane() !== 'issues'
            "
            [rows]="issues()"
            [busy]="busy()"
            [error]="error()"
            emptyTitle="No matching issues"
            emptyDescription="No issues match your current filters."
            (refresh)="refresh.emit()"
            (inspect)="inspect.emit($event)"
          />
        }
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        min-height: 0;
      }
      .history-layout {
        display: grid;
        grid-template-columns: minmax(260px, 300px) minmax(0, 1fr);
        gap: 1rem;
        min-height: 0;
      }
      ngx-publishing-filters {
        min-height: 0;
        max-height: 100%;
      }
      .request-workspace {
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: minmax(0, 1fr);
        min-width: 0;
        min-height: 0;
      }
      .request-workspace--issues {
        grid-template-columns: minmax(0, 2fr) minmax(260px, 1fr);
        gap: 1rem;
      }
      .request-workspace__switch {
        display: none;
      }
      @media (max-width: 1100px) and (min-width: 901px) {
        .history-layout {
          grid-template-columns: 260px minmax(0, 1fr);
        }
        .request-workspace--issues {
          grid-template-columns: minmax(0, 1fr) minmax(240px, 1fr);
          gap: 0.75rem;
        }
      }
      @media (max-width: 900px) {
        .history-layout {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(0, 1fr);
          gap: 0.5rem;
        }
        .request-workspace--issues {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(0, 1fr);
          gap: 0.25rem;
        }
        .request-workspace__switch {
          display: flex;
          gap: 0.5rem;
        }
        .request-workspace__switch button[aria-pressed='true'] {
          background: var(--ngx-color-surface-high);
        }
        .request-workspace--issues > ngx-publishing-request-panel {
          grid-column: 1;
          grid-row: 2;
        }
        .request-workspace__panel--hidden {
          display: none;
        }
      }
    `,
  ],
})
export class PublishingHistoryComponent {
  readonly rows = input.required<readonly HistoryRow[]>();
  readonly allRows = input.required<readonly HistoryRow[]>();
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
  readonly requests = computed(() =>
    this.rows().filter((row) => !this.isIssue(row))
  );
  readonly issues = computed(() =>
    this.rows().filter((row) => this.isIssue(row))
  );
  readonly hasIssues = computed(() =>
    this.allRows().some((row) => this.isIssue(row))
  );
  readonly selectedPane = signal<'requests' | 'issues' | null>(null);
  readonly activePane = computed(
    () =>
      this.selectedPane() ??
      (this.status() === 'needs_recovery' ||
      this.status() === 'unconfirmed'
        ? 'issues'
        : 'requests')
  );
  readonly emptyTitle = computed(() =>
    !this.total()
      ? 'No publishing requests yet'
      : this.issues().length
        ? 'No completed or running requests'
        : 'No matching requests'
  );
  readonly emptyDescription = computed(() =>
    !this.total()
      ? 'Start a new workshop to create learning materials with AI.'
      : this.issues().length
        ? 'Requests needing attention are in the Issues panel.'
        : 'Try another search or clear your filters.'
  );
  readonly workspaceHeight = signal(0);
  private readonly workspace =
    viewChild.required<ElementRef<HTMLElement>>('workspace');
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterNextRender(() =>
      this.destroyRef.onDestroy(
        observeWorkspaceHeight(
          this.workspace().nativeElement,
          (height) => this.workspaceHeight.set(height)
        )
      )
    );
  }
  private isIssue(row: HistoryRow): boolean {
    return (
      row.status === 'needs_recovery' || row.status === 'unconfirmed'
    );
  }
  changeStatus(status: HistoryFilter): void {
    this.selectedPane.set(null);
    this.statusChanged.emit(status);
  }
}
