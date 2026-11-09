import { NgTemplateOutlet } from '@angular/common';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  NgxButton,
  NgxEntrance,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import type {
  HistoryFilter,
  HistoryRow,
} from '../models/history.models';
import { observePanelBody } from '../utils/panel-body-viewport';

@Component({
  selector: 'ngx-publishing-filters',
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NgxButton,
    NgxEntrance,
    NgxPanel,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <details class="filters-mobile">
      <summary>Filter requests · {{ activeCount() }} active</summary>
      <div class="filters filters-mobile__body">
        <ng-container [ngTemplateOutlet]="fields" />
      </div>
    </details>
    <ngx-panel
      ngxEntrance="fade"
      heading="Filter console"
      eyebrow="PUBLISHER / FILTER"
      shape="chamfered"
      background="solid"
    >
      <aside
        #filterBody
        aria-label="Filter publishing requests"
        [style.max-height.px]="bodyHeight()"
      >
        <ng-container [ngTemplateOutlet]="fields" />
      </aside>
      <div ngxPanelActions class="filters__clear">
        <button
          mat-flat-button
          ngxButton
          surface="outline"
          shape="chamfered"
          type="button"
          (click)="clear.emit()"
          [disabled]="!activeCount()"
        >
          <mat-icon aria-hidden="true">filter_alt_off</mat-icon>Clear
          filters
        </button>
      </div>
    </ngx-panel>
    <ng-template #fields>
      <div class="publishing-filters__search-row">
        <mat-form-field
          appearance="outline"
          subscriptSizing="dynamic"
        >
          <mat-label>Search requests</mat-label>
          <mat-icon matPrefix>search</mat-icon>
          <input
            matInput
            type="search"
            [value]="search()"
            (input)="searchChanged.emit(searchValue($event))"
            placeholder="Name, request ID, message or step"
          />
        </mat-form-field>
      </div>
      <div
        class="filters__summary"
        aria-label="Publishing request summary"
      >
        @for (item of summary(); track item.label) {
        <div>
          <strong>{{ item.count }}</strong
          ><span>{{ item.label }}</span>
        </div>
        }
      </div>
      <!-- <p class="filters__scope">
        Latest {{ rows().length }} requests · up to 100 saved receipts
      </p> -->
      <div class="filters">
        <p class="filters__active">
          {{ activeCount() }}
          {{ activeCount() === 1 ? 'filter' : 'filters' }} active
        </p>
        <mat-form-field
          appearance="outline"
          subscriptSizing="dynamic"
        >
          <mat-label>Request status</mat-label>
          <select
            matNativeControl
            [value]="status()"
            (change)="changeStatus($event)"
          >
            <option value="all">All statuses</option>
            <option value="draft">Drafts</option>
            <option value="complete">Completed</option>
            <option value="running">Running</option>
            <option value="needs_recovery">Needs attention</option>
            <option value="unconfirmed">Unconfirmed</option>
          </select>
        </mat-form-field>
      </div>
    </ng-template>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        display: block;
        min-width: 0;
        align-self: start;
        position: sticky;
        top: calc(
          var(--publisher-toolbar-top, 96px) +
            var(--publisher-action-bar-height, 64px) + 12px
        );
        @include mat.form-field-density(-3);
      }
      .filters-mobile {
        display: none;
      }
      .filters {
        padding-top: 6px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        overflow-y: auto;
        scrollbar-width: thin;
      }
      mat-form-field {
        width: 100%;
        min-width: 0;
      }
      .filters__summary {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 0.35rem;
      }
      .filters__summary div {
        display: flex;
        flex-direction: column;
        padding: 0.6rem 0.45rem;
        color: var(--ngx-color-muted);
        background: var(--ngx-color-surface);
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius);
        font-size: 0.65rem;
        text-align: center;
      }
      .filters__summary strong {
        font-size: 1rem;
        color: var(--ngx-color-text);
      }
      .filters__scope,
      .filters__active {
        display: flex;
        justify-content: space-between;
        color: var(--ngx-color-muted);
        font: var(--ngx-font-label);
        font-size: 0.65rem;
        padding-top: 12px;
      }
      .filters__active {
        border-top: 1px solid var(--ngx-color-border);
      }
      .filters > * {
        flex-shrink: 0;
      }
      .filters__clear {
        width: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        margin-top: 1rem;
      }
      .publishing-filters__search-row {
        display: grid;
        gap: 8px;
        margin: 0.75rem 0 0.5rem;
      }
      @media (max-width: 900px) {
        :host {
          position: static;
        }
        ngx-panel {
          display: none;
        }
        .filters-mobile {
          display: block;
          position: relative;
          border: 1px solid var(--ngx-color-border);
          background: var(--ngx-color-surface);
        }
        .filters-mobile summary {
          padding: 0.6rem 0.75rem;
          cursor: pointer;
          font: var(--ngx-font-label);
        }
        .filters-mobile__body {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 20;
          max-height: min(24rem, 40dvh);
          overflow: auto;
          padding: 0.75rem;
          background: var(--ngx-color-surface);
          border: 1px solid var(--ngx-color-border);
          box-shadow: 0 8px 24px
            color-mix(
              in srgb,
              var(--ngx-color-canvas) 65%,
              transparent
            );
        }
        .filters {
          gap: 0.75rem;
        }
        .filters__summary {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        .filters__summary div {
          padding: 0.5rem 0.2rem;
          font-size: 0.6rem;
        }
      }
      @media (min-width: 901px) and (max-width: 1024px) and (hover: none) and (pointer: coarse) {
        :host {
          top: calc(
            var(--publisher-toolbar-top, 52px) +
              var(--publisher-action-bar-height, 64px) + 12px
          );
        }
        // Two column layout for compact screens
        .filters__summary {
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        // Last child in .filters__summary should be hidden on compact layout
        .filters__summary div:last-child {
          display: none;
        }
      }
    `,
  ],
})
export class PublishingFiltersComponent {
  readonly rows = input.required<readonly HistoryRow[]>();
  readonly search = input('');
  readonly status = input<HistoryFilter>('all');
  readonly searchChanged = output<string>();
  readonly statusChanged = output<HistoryFilter>();
  readonly clear = output<void>();
  readonly activeCount = computed(
    () =>
      Number(!!this.search().trim()) + Number(this.status() !== 'all')
  );
  readonly summary = computed(() => [
    {
      label: 'Completed',
      count: this.rows().filter((row) => row.status === 'complete')
        .length,
    },
    {
      label: 'Issues',
      count: this.rows().filter(
        (row) => row.status === 'needs_recovery'
      ).length,
    },
    {
      label: 'Unconfirmed',
      count: this.rows().filter((row) => row.status === 'unconfirmed')
        .length,
    },
  ]);
  readonly bodyHeight = signal<number | null>(null);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly body =
    viewChild.required<ElementRef<HTMLElement>>('filterBody');
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterNextRender(() =>
      this.destroyRef.onDestroy(
        observePanelBody(
          this.host.nativeElement,
          this.body().nativeElement,
          (height) => this.bodyHeight.set(height)
        )
      )
    );
  }
  searchValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }
  changeStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (
      value === 'all' ||
      value === 'draft' ||
      value === 'complete' ||
      value === 'running' ||
      value === 'needs_recovery' ||
      value === 'unconfirmed'
    ) {
      this.statusChanged.emit(value);
    }
  }
}
