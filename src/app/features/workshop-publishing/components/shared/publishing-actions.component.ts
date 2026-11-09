import { NgTemplateOutlet } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  NgxActionBar,
  NgxButton,
  NgxInlineStatus,
} from '@tmdjr/ngx-workshop-design-system';

@Component({
  selector: 'ngx-publishing-actions',
  imports: [
    NgTemplateOutlet,
    NgxActionBar,
    NgxButton,
    NgxInlineStatus,
    MatButton,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (journeyHeading()) {
    <header
      #journeyBar
      class="publisher-actions__bar"
      aria-label="Workshop publishing actions"
    >
      <ng-content select="[publisherJourney]" />
      <ng-container [ngTemplateOutlet]="statusIndicator" />
      <div class="publisher-actions__buttons">
        <ng-container [ngTemplateOutlet]="buttons" />
      </div>
    </header>
    } @else {
    <ngx-action-bar
      [heading]="heading()"
      (heightChange)="heightChange.emit($event)"
    >
      <ng-container
        ngxActionBarIndicators
        [ngTemplateOutlet]="statusIndicator"
      />
      <ng-container [ngTemplateOutlet]="buttons" />
    </ngx-action-bar>
    }
    <ng-template #statusIndicator>
      <ngx-inline-status
        [label]="
          status() ||
          (disabled() ? 'Loading publisher…' : 'Workshop publishing')
        "
        [tone]="disabled() ? 'info' : 'neutral'"
        [announce]="true"
      />
    </ng-template>
    <ng-template #buttons>
      @if (showBack()) {
      <button
        mat-flat-button
        ngxButton
        shape="chevron"
        surface="glass"
        type="button"
        [disabled]="disabled()"
        (click)="back.emit()"
      >
        <mat-icon aria-hidden="true">arrow_forward</mat-icon>Request
        history
      </button>
      } @if (showCreate()) {
      <button
        mat-flat-button
        ngxButton
        shape="chevron"
        surface="outline"
        type="button"
        [disabled]="disabled()"
        (click)="createWorkshop.emit()"
      >
        <mat-icon aria-hidden="true">add</mat-icon>New workshop
      </button>
      }
    </ng-template>
  `,
  styles: [
    `
      :host {
        display: contents;
        --ngx-action-bar-top: var(--publisher-toolbar-top, 96px);
      }
      .publisher-actions__bar {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: var(--ngx-space-4);
        position: sticky;
        top: var(--ngx-action-bar-top);
        z-index: var(--ngx-action-bar-z-index, 10);
        box-sizing: border-box;
        min-height: 56px;
        width: 100%;
        padding: 0.5rem 1rem;
        border-bottom: 1px solid var(--ngx-color-border);
        background: var(--ngx-color-canvas);
        color: var(--ngx-color-text);
      }
      .publisher-actions__buttons {
        display: flex;
        flex-wrap: wrap;
        gap: var(--ngx-space-2);
        margin-inline-start: auto;
      }
      @media (max-width: 720px) {
        :host {
          --ngx-action-bar-top: var(--publisher-toolbar-top, 76px);
        }
      }
      @media (min-width: 900px) and (max-width: 1024px) {
        :host {
          --ngx-action-bar-top: var(--publisher-toolbar-top, 52px);
        }
      }
    `,
  ],
})
export class PublishingActionsComponent {
  readonly heightChange = output<number>();
  readonly heading = input('AI Publisher');
  readonly journeyHeading = input(false);
  private readonly journeyBar =
    viewChild<ElementRef<HTMLElement>>('journeyBar');
  constructor() {
    afterRenderEffect((onCleanup) => {
      const bar = this.journeyBar()?.nativeElement;
      if (!bar) return;
      const measure = () =>
        this.heightChange.emit(
          Math.ceil(bar.getBoundingClientRect().height)
        );
      const observer = new ResizeObserver(measure);
      observer.observe(bar);
      measure();
      onCleanup(() => observer.disconnect());
    });
  }
  readonly disabled = input(false);
  readonly status = input('');
  readonly showCreate = input(true);
  readonly showBack = input(false);
  readonly createWorkshop = output<void>();
  readonly back = output<void>();
}
