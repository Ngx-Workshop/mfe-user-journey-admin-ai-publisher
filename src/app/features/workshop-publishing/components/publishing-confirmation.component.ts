import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { WorkshopDraft } from '../models/publishing.models';

@Component({
  selector: 'ngx-publishing-confirmation',
  imports: [MatButtonModule, NgxButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="confirmation" aria-label="Publication checkpoint">
      <p class="confirmation__eyebrow">REVIEWED DRAFT</p>
      <h3>{{ draft().name }}</h3>
      <p>{{ draft().summary }}</p>
      <dl class="confirmation__counts">
        <div>
          <dt>Documentation pages</dt>
          <dd>{{ draft().pages.length }}</dd>
        </div>
        <div>
          <dt>Coding labs</dt>
          <dd>{{ draft().labs.length }}</dd>
        </div>
        <div>
          <dt>Assessment questions</dt>
          <dd>{{ draft().assessment.testQuestions.length }}</dd>
        </div>
      </dl>
      <p>
        Publishing makes these resources available immediately. Coding
        labs must pass verification first.
      </p>
      <p class="confirmation__note">
        When publishing finishes, the receipt detail page will open
        to show which resources were published.
      </p>
      @if (showActions()) {
        <div class="confirmation__actions">
          <button
            mat-button
            ngxButton
            surface="outline"
            type="button"
            [disabled]="locked()"
            (click)="back.emit()"
          >
            Back to review
          </button>
          <button
            mat-flat-button
            ngxButton
            shape="chevron"
            type="button"
            [disabled]="locked() || !reviewed()"
            (click)="publish.emit()"
          >
            Publish reviewed workshop
          </button>
        </div>
      }
    </section>
  `,
  styles: `
    .confirmation {
      max-width: 85ch;
      overflow-wrap: anywhere;
    }
    h3 {
      font-size: 1.65rem;
      margin-top: 0.75rem;
    }
    p {
      line-height: 1.7;
    }
    .confirmation__eyebrow {
      color: var(--ngx-color-primary);
      font: 0.7rem var(--ngx-font-mono);
    }
    .confirmation__counts {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .confirmation__counts > div {
      border: 1px solid var(--ngx-color-border);
      padding: 1rem;
      background: var(--ngx-color-surface);
    }
    dt {
      color: var(--ngx-color-muted);
      font-size: 0.8rem;
    }
    dd {
      font: 1.75rem var(--ngx-font-mono);
      margin: 0.5rem 0 0;
    }
    .confirmation__actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin: 1.5rem 0;
    }
    .confirmation__note {
      color: var(--ngx-color-muted);
    }
    @media (max-width: 550px) {
      .confirmation__counts {
        grid-template-columns: 1fr;
      }
    }
  `,
})
export class PublishingConfirmationComponent {
  readonly draft = input.required<WorkshopDraft>();
  readonly locked = input(false);
  readonly showActions = input(true);
  readonly reviewed = input(false);
  readonly back = output<void>();
  readonly publish = output<void>();
}
