import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'ngx-publishing-actions',
  imports: [MatButton, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="publisher-actions__content" role="group" aria-label="Workshop actions">
      @if (showBack()) {
        <button matButton type="button" class="publisher-actions__back" [disabled]="disabled()" (click)="back.emit()">
          <mat-icon aria-hidden="true">arrow_back</mat-icon>
          Request history
        </button>
      }
      <button matButton="filled" type="button" [disabled]="disabled()" (click)="createWorkshop.emit()">
        <mat-icon aria-hidden="true">add</mat-icon>
        New workshop
      </button>
    </div>
  `,
  styles: [`
    :host {
      position: sticky;
      top: 56px;
      z-index: 10;
      display: flex;
      align-items: center;
      min-height: 64px;
      background: var(--mat-sys-primary);
      backdrop-filter: blur(16px);
      box-shadow: 0 8px 24px rgba(20, 24, 40, 0.04);
    }
    .publisher-actions__content {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      width: min(100% - 3rem, 1440px);
      margin: 0 auto;
      padding: 0.5rem 0;
    }
    .publisher-actions__back { margin-right: auto; --mat-button-text-label-text-color: var(--mat-sys-on-primary); }
    @media (max-width: 700px) {
      .publisher-actions__content { width: min(100% - 2rem, 1440px); }
    }
  `],
})
export class PublishingActionsComponent {
  readonly disabled = input(false);
  readonly showBack = input(false);
  readonly createWorkshop = output<void>();
  readonly back = output<void>();
}
