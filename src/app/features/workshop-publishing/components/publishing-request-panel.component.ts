import {
  afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, ElementRef,
  inject, input, output, signal, viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgxPanel } from '@tmdjr/ngx-workshop-design-system';
import type { HistoryRow } from '../models/history.models';
import { observePanelBody } from '../utils/panel-body-viewport';
import { PublishingRequestRowComponent } from './publishing-request-row.component';

@Component({
  selector: 'ngx-publishing-request-panel',
  imports: [NgxPanel, MatButtonModule, MatIconModule, MatProgressBarModule, PublishingRequestRowComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-panel [heading]="issues() ? 'Issues' : 'Request history'"
      [eyebrow]="issues() ? 'PUBLISHER / RECOVER' : 'PUBLISHER / REQUESTS'"
      [shape]="issues() ? 'beveled' : 'stepped'" [background]="issues() ? 'solid' : 'grid'"
      [tone]="issues() ? 'secondary' : 'primary'"
      [attr.aria-label]="issues() ? 'Publishing issues' : 'Request history'" [attr.aria-busy]="busy()">
      <div ngxPanelHeader class="request-panel__toolbar">
        <span role="status">{{ rows().length }} {{ issues() ? (rows().length === 1 ? 'issue' : 'issues') : (rows().length === 1 ? 'request' : 'requests') }}</span>
        @if (!issues()) {
          <button mat-icon-button type="button" [disabled]="busy()" aria-label="Refresh history"
            title="Refresh history" (click)="refresh.emit()"><mat-icon>refresh</mat-icon></button>
        }
      </div>
      <section #body class="request-panel__body" [style.height.px]="bodyHeight()">
        @if (busy()) { <mat-progress-bar mode="indeterminate" [attr.aria-label]="issues() ? 'Loading publishing issues' : 'Loading publishing requests'" /> }
        @if (error()) {
          <div class="request-panel__error" role="alert">{{ error() }}
            <button mat-button type="button" [disabled]="busy()" (click)="refresh.emit()">Retry</button>
          </div>
        }
        <div class="request-panel__rows" tabindex="0" role="region"
          [attr.aria-label]="issues() ? 'Scrollable publishing issues' : 'Scrollable publishing requests'">
          @for (row of rows(); track row.requestId) {
            <ngx-publishing-request-row [row]="row" [busy]="busy()" (inspect)="inspect.emit($event)" />
          } @empty {
            @if (!busy() && !error()) {
              <div class="request-panel__empty">
                <h3>{{ emptyTitle() }}</h3>
                <p>{{ emptyDescription() }}</p>
              </div>
            }
          }
        </div>
      </section>
      <p ngxPanelActions class="request-panel__hint">{{ issues()
        ? 'Inspect a receipt before retrying a publishing request.'
        : 'Inspect a receipt for complete progress and result details.' }}</p>
    </ngx-panel>
  `,
  styles: [`
    @use '@angular/material' as mat;
    :host { display: block; min-width: 0; min-height: 0; height: 100%; @include mat.icon-button-density(-3); }
    ngx-panel { height: auto; }
    .request-panel__toolbar { display: flex; align-items: center; gap: 0.5rem; font: var(--ngx-font-label); font-size: 0.7rem; }
    .request-panel__body { display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
    .request-panel__rows { flex: 1; min-height: 0; overflow: auto; scrollbar-width: thin; border: 1px solid var(--ngx-color-border); }
    .request-panel__rows:focus-visible { outline: 2px solid var(--ngx-color-primary); outline-offset: -2px; }
    .request-panel__error { flex-shrink: 0; max-height: 40%; overflow: auto; color: var(--ngx-color-error); font-size: 0.75rem; }
    mat-progress-bar { flex-shrink: 0; }
    .request-panel__empty { padding: 1rem; text-align: center; font-size: 0.75rem; }
    .request-panel__empty h3 { font-size: 0.85rem; }
    .request-panel__hint { margin: 0; font: var(--ngx-font-label); font-size: 0.65rem; color: var(--ngx-color-muted); }
  `],
})
export class PublishingRequestPanelComponent {
  readonly rows = input.required<readonly HistoryRow[]>();
  readonly issues = input(false);
  readonly busy = input(false);
  readonly error = input('');
  readonly emptyTitle = input('No matching requests');
  readonly emptyDescription = input('Try another search or clear your filters.');
  readonly refresh = output<void>();
  readonly inspect = output<string>();
  readonly bodyHeight = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly body = viewChild.required<ElementRef<HTMLElement>>('body');
  private readonly destroyRef = inject(DestroyRef);
  constructor() {
    afterNextRender(() => this.destroyRef.onDestroy(observePanelBody(
      this.host.nativeElement, this.body().nativeElement,
      height => this.bodyHeight.set(height ?? 0), 'container',
    )));
  }
}
