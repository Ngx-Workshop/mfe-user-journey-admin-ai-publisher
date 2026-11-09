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
import { ActivatedRoute, Router } from '@angular/router';
import { PublishingActionsComponent } from '../../components/shared/publishing-actions.component';
import { ReceiptStepResultComponent } from '../../components/receipt/receipt-step-result.component';
import { ReceiptWorkspacePanelComponent } from '../../components/receipt/receipt-workspace-panel.component';
import { ReceiptSummaryComponent } from '../../components/receipt/receipt-summary.component';
import { ReceiptProgressComponent } from '../../components/receipt/receipt-progress.component';
import { ReceiptViewModel } from './receipt.view-model';

@Component({
  host: {
    class: 'ngx-design-system',
    '[style.--receipt-action-height.px]': 'actionBarHeight()',
  },
  selector: 'ngx-publishing-receipt',
  imports: [
    MatButtonModule,
    MatIconModule,
    PublishingActionsComponent,
    ReceiptWorkspacePanelComponent,
    ReceiptStepResultComponent,
    ReceiptSummaryComponent,
    ReceiptProgressComponent,
  ],
  providers: [ReceiptViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-actions
      heading="Publishing receipt"
      (heightChange)="actionBarHeight.set($event)"
      [showBack]="true"
      [showCreate]="false"
      [disabled]="vm.busy()"
      (back)="back()"
    />
    <main
      class="receipt"
      aria-label="Publishing receipt"
      [attr.aria-busy]="vm.busy()"
    >
      <div class="receipt__workspace">
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
          <ngx-receipt-summary
            [requestId]="vm.requestId()"
            [receipt]="vm.receipt()"
            [busy]="vm.busy()"
            [invalid]="vm.invalid()"
            [error]="vm.error()"
            [progress]="vm.progress()"
            [failedVerifications]="vm.failedVerifications()"
            (refresh)="vm.refresh()"
          />
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
          <ngx-receipt-progress
            [steps]="vm.steps()"
            [selected]="vm.selectedIndex()"
            [busy]="vm.busy()"
            (selectStep)="selectStep($event)"
          />
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
  styles: `
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
      grid-template-columns: minmax(240px, 300px) minmax(
          300px,
          1fr
        ) minmax(0, 1.4fr);
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
    .receipt__count {
      font: var(--ngx-font-label);
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
}
