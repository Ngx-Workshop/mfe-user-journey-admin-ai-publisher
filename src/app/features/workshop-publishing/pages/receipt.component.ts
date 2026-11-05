import { JsonPipe } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  NgxCodeBlock,
  NgxInlineStatus,
} from '@tmdjr/ngx-workshop-design-system';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingStatusComponent } from '../components/publishing-status.component';
import { ReceiptWorkspacePanelComponent } from '../components/receipt-workspace-panel.component';
import { observeWorkspaceHeight } from '../utils/panel-body-viewport';
import { ReceiptViewModel } from './receipt.view-model';

@Component({
  host: { class: 'ngx-design-system' },
  selector: 'ngx-publishing-receipt',
  imports: [
    NgxCodeBlock,
    NgxInlineStatus,
    JsonPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PublishingActionsComponent,
    PublishingStatusComponent,
    ReceiptWorkspacePanelComponent,
  ],
  providers: [ReceiptViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-actions
      heading="Publishing receipt"
      [showBack]="true"
      [disabled]="vm.busy()"
      (back)="back()"
      (createWorkshop)="createWorkshop()"
    />
    <main
      class="receipt"
      aria-label="Publishing receipt"
      [attr.aria-busy]="vm.busy()"
    >
      <div
        #workspace
        class="receipt__workspace"
        [style.height.px]="workspaceHeight()"
      >
        <div
          class="receipt__switch"
          role="group"
          aria-label="Receipt panels"
        >
          <button
            mat-button
            type="button"
            [attr.aria-pressed]="pane() === 'receipt'"
            (click)="pane.set('receipt')"
          >
            Receipt
          </button>
          <button
            mat-button
            type="button"
            [attr.aria-pressed]="pane() === 'progress'"
            (click)="pane.set('progress')"
          >
            Progress
          </button>
          <button
            mat-button
            type="button"
            [attr.aria-pressed]="pane() === 'step'"
            (click)="pane.set('step')"
          >
            Step details
          </button>
        </div>
        <ngx-receipt-workspace-panel
          class="receipt__panel"
          [class.receipt__panel--hidden]="pane() !== 'receipt'"
          heading="Receipt details"
          eyebrow="PUBLISHER / RECEIPT"
          shape="chamfered"
          scrollLabel="Scrollable receipt details"
        >
          <button
            receiptPanelHeader
            mat-icon-button
            type="button"
            [disabled]="vm.busy() || vm.invalid()"
            aria-label="Refresh receipt"
            title="Refresh receipt"
            (click)="vm.refresh()"
          >
            <mat-icon>refresh</mat-icon>
          </button>
          <div class="receipt__summary">
            @if (vm.receipt(); as receipt) {
              <ngx-publishing-status [status]="receipt.status" />
            }
            <h2>Request ID</h2>
            <p class="receipt__id">{{ vm.requestId() }}</p>
            @if (vm.busy()) {
              <mat-progress-bar
                mode="indeterminate"
                aria-label="Loading publishing receipt"
              />
              <p role="status">Loading receipt…</p>
            }
            @if (vm.error()) {
              <div class="receipt__error" role="alert">
                {{ vm.error() }}
                @if (!vm.invalid()) {
                  <button
                    mat-button
                    type="button"
                    [disabled]="vm.busy()"
                    (click)="vm.refresh()"
                  >
                    Retry
                  </button>
                }
              </div>
            }
            @if (vm.receipt(); as receipt) {
              <h2>Progress</h2>
              <p>{{ vm.progress() }}</p>
              @if (receipt.message) {
                <h2>Message</h2>
                <p>{{ receipt.message }}</p>
              }
              @if (receipt.status === 'needs_recovery') {
                <p class="receipt__recovery">
                  Keep this request ID and check its receipt before
                  starting another publish attempt.
                </p>
              }
            }
          </div>
          <span receiptPanelFooter
            >Keep the request ID for receipt recovery.</span
          >
        </ngx-receipt-workspace-panel>
        <ngx-receipt-workspace-panel
          class="receipt__progress-panel"
          [class.receipt__panel--hidden]="pane() !== 'progress'"
          heading="Publishing progress"
          eyebrow="PUBLISHER / STEPS"
          background="grid"
          scrollLabel="Scrollable publishing progress"
        >
          <span receiptPanelHeader class="receipt__count"
            >{{ vm.steps().length }} steps</span
          >
          <ol class="receipt__steps" role="list">
            @for (step of vm.steps(); track $index) {
              <li class="receipt__step">
                <button
                  class="receipt__step-button"
                  type="button"
                  [title]="step.label"
                  [attr.aria-pressed]="vm.selectedIndex() === $index"
                  (click)="selectStep($index)"
                >
                  <span class="receipt__step-number">{{
                    $index + 1
                  }}</span>
                  <span class="receipt__step-label">{{
                    step.label
                  }}</span>
                  <ngx-inline-status
                    [label]="
                      step.status === 'complete'
                        ? 'Completed'
                        : 'Pending'
                    "
                    [tone]="
                      step.status === 'complete'
                        ? 'success'
                        : 'neutral'
                    "
                  />
                  <mat-icon aria-hidden="true"
                    >chevron_right</mat-icon
                  >
                </button>
              </li>
            } @empty {
              <li class="receipt__empty">
                {{
                  vm.busy()
                    ? 'Loading publishing steps…'
                    : 'No publishing steps reported yet.'
                }}
              </li>
            }
          </ol>
          <span receiptPanelFooter
            >Select a step to inspect its result.</span
          >
        </ngx-receipt-workspace-panel>
        <ngx-receipt-workspace-panel
          class="receipt__step-panel"
          [class.receipt__panel--hidden]="pane() !== 'step'"
          [resetKey]="vm.selectedStep()"
          heading="Step details"
          eyebrow="PUBLISHER / RESULT"
          shape="beveled"
          scrollLabel="Scrollable selected step details"
        >
          @if (vm.selectedStep(); as step) {
            <div class="receipt__selected-heading">
              <h2>{{ step.label }}</h2>
              <ngx-inline-status
                [label]="
                  step.status === 'complete' ? 'Completed' : 'Pending'
                "
                [tone]="
                  step.status === 'complete' ? 'success' : 'neutral'
                "
              />
            </div>
            @if (step.result !== undefined) {
              <div class="receipt__result-code">
                <ngx-code-block
                  [code]="(step.result | json) ?? ''"
                  language="json"
                  [label]="step.label + ' result'"
                  [wrap]="true"
                />
              </div>
            } @else {
              <p class="receipt__empty">
                No result reported for this step.
              </p>
            }
          } @else {
            <p class="receipt__empty">
              {{
                vm.busy()
                  ? 'Loading step details…'
                  : 'Select a publishing step to view its details.'
              }}
            </p>
          }
          <span receiptPanelFooter
            >Result JSON can be copied from the code block.</span
          >
        </ngx-receipt-workspace-panel>
      </div>
    </main>
  `,
  styles: [
    `
      @use '@angular/material' as mat;
      :host {
        display: block;
        min-width: 0;
        color: var(--ngx-color-text);
        background: var(--ngx-color-canvas);
        @include mat.icon-button-density(-3);
      }
      .receipt {
        width: calc(100% - 2rem);
        margin: 0 auto;
        padding: 1rem 0;
      }
      .receipt__workspace {
        display: grid;
        grid-template-columns: minmax(240px, 300px) minmax(
            300px,
            1fr
          ) minmax(0, 1.4fr);
        grid-template-rows: minmax(0, 1fr);
        gap: 1rem;
        min-height: 0;
        min-width: 0;
      }
      .receipt__switch {
        display: none;
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
      .receipt__count {
        font: var(--ngx-font-label);
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
      .receipt__selected-heading {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        align-items: center;
        margin-bottom: 0.75rem;
      }
      .receipt__selected-heading h2 {
        margin: 0;
        font: 600 0.8rem/1.5 var(--ngx-font-mono);
        color: var(--ngx-color-text);
        overflow-wrap: anywhere;
      }
      .receipt__result-code {
        position: relative;
        min-width: 0;
      }
      .receipt__empty {
        padding: 8px;
        font-size: 0.75rem;
      }
      @media (max-width: 1100px) {
        .receipt {
          width: calc(100% - 1rem);
          padding: 0.5rem 0 1rem;
        }
        .receipt__workspace {
          grid-template-columns: minmax(0, 1fr);
          grid-template-rows: auto minmax(0, 1fr);
          gap: 0.5rem;
        }
        .receipt__switch {
          display: flex;
          flex-wrap: wrap;
          gap: 0.25rem;
        }
        .receipt__switch button[aria-pressed='true'] {
          background: var(--ngx-color-surface-high);
        }
        ngx-receipt-workspace-panel {
          grid-column: 1;
          grid-row: 2;
        }
        .receipt__panel--hidden {
          display: none;
        }
      }
    `,
  ],
})
export class ReceiptComponent implements OnInit {
  readonly vm = inject(ReceiptViewModel);
  readonly workspaceHeight = signal(0);
  readonly pane = signal<'receipt' | 'progress' | 'step'>('receipt');
  private readonly workspace =
    viewChild.required<ElementRef<HTMLElement>>('workspace');
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
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
  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.pane.set('receipt');
        this.vm.load(params.get('requestId') ?? '');
      });
  }
  selectStep(index: number): void {
    this.vm.selectStep(index);
    this.pane.set('step');
  }
  back(): void {
    void this.router.navigate(['../../overview'], {
      relativeTo: this.route,
      queryParamsHandling: 'preserve',
    });
  }
  createWorkshop(): void {
    void this.router.navigate(['../../new'], {
      relativeTo: this.route,
    });
  }
}
