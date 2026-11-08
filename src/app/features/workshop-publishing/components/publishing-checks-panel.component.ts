import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import { observePanelBody } from '../utils/panel-body-viewport';
@Component({
  selector: 'ngx-publishing-checks-panel',
  imports: [NgxPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-panel
      heading="Checks"
      eyebrow="SKILLS AND CHECKS"
      shape="chamfered"
      background="solid"
      aria-label="Skills and checks"
    >
      <div
        #body
        class="checks-panel__body"
        [style.height.px]="bodyHeight()"
        tabindex="0"
        role="region"
        aria-label="Skill and check activity"
      >
        <ng-content />
      </div>
      <div ngxPanelActions class="checks-panel__actions">
        <ng-content select="[publisherChecksActions]" />
      </div>
    </ngx-panel>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      min-height: 0;
    }
    ngx-panel {
      display: block;
      height: auto;
    }
    .checks-panel__body {
      min-height: 0;
      overflow: auto;
      scrollbar-width: thin;
    }
    .checks-panel__body:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: -2px;
    }
    .checks-panel__actions {
      min-width: 0;
    }
  `,
})
export class PublishingChecksPanelComponent {
  readonly bodyHeight = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly body =
    viewChild.required<ElementRef<HTMLElement>>('body');
  constructor() {
    afterRenderEffect((onCleanup) =>
      onCleanup(
        observePanelBody(
          this.host.nativeElement,
          this.body().nativeElement,
          (height) => this.bodyHeight.set(height ?? 0),
          'container'
        )
      )
    );
  }
}
