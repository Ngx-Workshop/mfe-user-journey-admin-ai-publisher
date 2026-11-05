import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
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
    NgxActionBar,
    NgxButton,
    NgxInlineStatus,
    MatButton,
    MatIcon,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-action-bar
      [heading]="heading()"
      (heightChange)="heightChange.emit($event)"
    >
      <ngx-inline-status
        ngxActionBarIndicators
        [label]="
          status() ||
          (disabled() ? 'Loading publisher…' : 'Workshop publishing')
        "
        [tone]="disabled() ? 'info' : 'neutral'"
        [announce]="true"
      />
      @if (showBack()) {
        <button
          mat-flat-button
          ngxButton
          surface="glass"
          type="button"
          [disabled]="disabled()"
          (click)="back.emit()"
        >
          <mat-icon aria-hidden="true">arrow_back</mat-icon>Request
          history
        </button>
      }
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
    </ngx-action-bar>
  `,
  styles: [
    `
      :host {
        display: contents;
        --ngx-action-bar-top: var(--publisher-toolbar-top, 96px);
      }
      @media (max-width: 720px) {
        :host {
          --ngx-action-bar-top: var(--publisher-toolbar-top, 76px);
        }
      }
    `,
  ],
})
export class PublishingActionsComponent {
  readonly heightChange = output<number>();
  readonly heading = input('AI Publisher');
  readonly disabled = input(false);
  readonly status = input('');
  readonly showBack = input(false);
  readonly createWorkshop = output<void>();
  readonly back = output<void>();
}
