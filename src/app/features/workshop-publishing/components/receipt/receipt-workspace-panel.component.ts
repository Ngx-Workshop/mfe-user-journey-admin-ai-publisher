import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import {
  NgxPanel,
  NgxPanelBackground,
  NgxPanelShape,
} from '@tmdjr/ngx-workshop-design-system';
import { observePanelBody } from '../../utils/panel-body-viewport';

@Component({
  selector: 'ngx-receipt-workspace-panel',
  host: { '[class.receipt-panel--natural]': '!bounded()' },
  imports: [NgxPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-panel
      [heading]="heading()"
      [eyebrow]="eyebrow()"
      [shape]="shape()"
      [background]="background()"
    >
      <div ngxPanelHeader class="receipt-panel__tools">
        <ng-content select="[receiptPanelHeader]" />
      </div>
      <div
        #body
        class="receipt-panel__body"
        [style.height.px]="bounded() ? bodyHeight() : null"
        tabindex="0"
        role="region"
        [attr.aria-label]="scrollLabel()"
      >
        <ng-content />
      </div>
      <div ngxPanelActions class="receipt-panel__footer">
        <ng-content select="[receiptPanelFooter]" />
      </div>
    </ngx-panel>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
        min-height: 0;
        min-width: 0;
      }
      :host(.receipt-panel--natural) {
        height: auto;
      }
      :host(.receipt-panel--natural) .receipt-panel__body {
        overflow: visible;
      }
      ngx-panel {
        height: auto;
      }
      .receipt-panel__tools {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
      .receipt-panel__body {
        position: relative;
        min-height: 0;
        overflow: auto;
        scrollbar-width: thin;
      }
      .receipt-panel__body:focus-visible {
        outline: 2px solid var(--ngx-color-primary);
        outline-offset: -2px;
      }
      .receipt-panel__footer {
        min-width: 0;
        font: var(--ngx-font-label);
        font-size: 0.65rem;
        color: var(--ngx-color-muted);
      }
    `,
  ],
})
export class ReceiptWorkspacePanelComponent {
  readonly heading = input.required<string>();
  readonly eyebrow = input.required<string>();
  readonly scrollLabel = input.required<string>();
  readonly shape = input<NgxPanelShape>('stepped');
  readonly background = input<NgxPanelBackground>('solid');
  readonly bounded = input(true);
  readonly resetKey = input<unknown>(null);
  readonly bodyHeight = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly body =
    viewChild.required<ElementRef<HTMLElement>>('body');
  constructor() {
    afterRenderEffect(() => {
      this.resetKey();
      this.body().nativeElement.scrollTop = 0;
    });
    afterRenderEffect((onCleanup) => {
      if (!this.bounded()) return;
      onCleanup(
        observePanelBody(
          this.host.nativeElement,
          this.body().nativeElement,
          (height) => this.bodyHeight.set(height ?? 0),
          'container'
        )
      );
    });
  }
}
