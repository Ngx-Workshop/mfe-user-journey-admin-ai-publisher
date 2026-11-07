import { PublishingPreparationComponent } from '../components/publishing-preparation.component';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxInlineStatus } from '@tmdjr/ngx-workshop-design-system';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingStatusComponent } from '../components/publishing-status.component';
import { ReceiptWorkspacePanelComponent } from '../components/receipt-workspace-panel.component';
import { ReceiptStepResultComponent } from '../components/receipt-step-result.component';
import { ReceiptViewModel } from './receipt.view-model';

@Component({
  host: {
    class: 'ngx-design-system',
    '[style.--receipt-action-height.px]': 'actionBarHeight()',
  },
  selector: 'ngx-publishing-receipt',
  imports: [
    NgxInlineStatus,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    PublishingActionsComponent,
    PublishingStatusComponent,
    ReceiptWorkspacePanelComponent,
    ReceiptStepResultComponent,
    PublishingPreparationComponent,
  ],
  providers: [ReceiptViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-actions
      heading="Publishing receipt"
      (heightChange)="actionBarHeight.set($event)"
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
      @if (vm.receipt()?.preparation; as preparation) {
        <details>
          <summary>Preparation skills and checks</summary>
          <ngx-publishing-preparation
            [report]="preparation"
            [locked]="true"
          />
        </details>
      }
      <div #workspace class="receipt__workspace">
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
              @if (vm.failedVerifications().length) {
                <div
                  class="receipt__verification-warning"
                  role="status"
                >
                  <h2>Coding lab verification failed</h2>
                  <p>
                    Completed steps count finished operations, not
                    passing tests. Review the failed verification
                    results and fix the coding lab before continuing.
                  </p>
                  @for (
                    failed of vm.failedVerifications();
                    track failed.name
                  ) {
                    @if (failed.labEditorUrl; as url) {
                      <a
                        [href]="url"
                        target="_blank"
                        rel="noopener noreferrer"
                        >Open {{ failed.label }} in coding lab editor
                        ↗</a
                      >
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
                  <span class="receipt__step-label"
                    >{{ step.label }}
                    @if (step.verification; as verification) {
                      <small
                        class="receipt__verification-label"
                        [class.receipt__verification-label--failed]="
                          !verification.passed
                        "
                        >{{
                          verification.passed
                            ? 'Verification passed'
                            : 'Verification failed'
                        }}</small
                      >
                    }
                  </span>
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
          #resultPanel
          class="receipt__step-panel"
          [bounded]="false"
          [class.receipt__panel--hidden]="pane() !== 'step'"
          [resetKey]="vm.selectedStep()"
          heading="Step details"
          eyebrow="PUBLISHER / RESULT"
          shape="beveled"
          scrollLabel="Scrollable selected step details"
        >
          @if (vm.selectedStep(); as step) {
            <ngx-receipt-step-result [step]="step" />
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
        --receipt-toolbar-top: var(--publisher-toolbar-top, 96px);
        --receipt-sticky-top: calc(
          var(--receipt-toolbar-top) +
            var(--receipt-action-height, 70px) + 16px
        );
        --receipt-available-height: max(
          180px,
          calc(100dvh - var(--receipt-sticky-top) - 16px)
        );
        @include mat.icon-button-density(-3);
      }
      .receipt {
        width: calc(100% - 2rem);
        margin: 0 auto;
        padding: 1rem 0;
      }
      .receipt__workspace {
        display: grid;
        grid-template-columns:
          minmax(240px, 300px) minmax(300px, 1fr)
          minmax(0, 1.4fr);
        align-items: start;
        gap: 1rem;
        min-height: 0;
        min-width: 0;
      }
      .receipt__panel,
      .receipt__progress-panel {
        position: sticky;
        top: var(--receipt-sticky-top);
        height: var(--receipt-available-height);
      }
      .receipt__step-panel {
        height: auto;
        scroll-margin-top: var(--receipt-sticky-top);
      }
      .receipt__switch {
        display: none;
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
      .receipt__verification-label {
        display: block;
        font-size: 0.65rem;
        color: var(--ngx-color-success);
      }
      .receipt__verification-label--failed {
        color: var(--ngx-color-error);
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
          grid-template-rows: auto auto;
          gap: 0.5rem;
        }
        .receipt__panel,
        .receipt__progress-panel {
          position: relative;
          top: auto;
        }
        .receipt__switch {
          position: sticky;
          top: var(--receipt-sticky-top);
          z-index: 2;
          background: var(--ngx-color-canvas);
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
        .receipt__step-panel {
          scroll-margin-top: calc(var(--receipt-sticky-top) + 48px);
        }
        .receipt__panel--hidden {
          display: none;
        }
      }
      @media (max-width: 720px) {
        :host {
          --receipt-toolbar-top: var(--publisher-toolbar-top, 76px);
        }
      }
    `,
  ],
})
export class ReceiptComponent implements OnInit {
  readonly vm = inject(ReceiptViewModel);
  readonly actionBarHeight = signal(70);
  readonly pane = signal<'receipt' | 'progress' | 'step'>('receipt');
  private readonly resultPanel = viewChild.required<
    ReceiptWorkspacePanelComponent,
    ElementRef<HTMLElement>
  >('resultPanel', { read: ElementRef });
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
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
    afterNextRender(
      () =>
        this.resultPanel().nativeElement.scrollIntoView({
          block: 'start',
        }),
      { injector: this.injector }
    );
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
