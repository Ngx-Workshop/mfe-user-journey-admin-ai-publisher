import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ngx-publishing-journey',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="journey" aria-label="Workshop creation phases">
      @for (phase of phases; track $index; let index = $index) {
        <button
          class="journey__phase"
          type="button"
          [class.journey__phase--active]="step() === index"
          [attr.aria-current]="step() === index ? 'step' : null"
          [disabled]="
            locked() ||
            (index === 1 && !hasSource()) ||
            (index === 2 && !reviewed())
          "
          (click)="navigate.emit(index)"
        >
          <span class="journey__number">{{
            index < step() ? '✓' : index + 1
          }}</span>
          <span
            ><strong>{{ phase.title }}</strong
            ><small>{{ phase.detail }}</small></span
          >
        </button>
      }
    </nav>
  `,
  styles: `
    .journey {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .journey__phase {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 1rem;
      text-align: left;
      font: inherit;
      color: var(--ngx-color-muted);
      border: 1px solid var(--ngx-color-border);
      background: var(--ngx-color-surface);
      cursor: pointer;
      min-width: 0;
    }
    .journey__number {
      font: 1.15rem var(--ngx-font-mono);
      color: var(--ngx-color-primary);
    }
    strong,
    small {
      display: block;
    }
    small {
      margin-top: 0.3rem;
      font-size: 0.75rem;
    }
    .journey__phase--active {
      border-color: var(--ngx-color-primary);
      background: var(--ngx-color-surface-high);
      color: var(--ngx-color-text);
    }
    .journey__phase:disabled {
      cursor: default;
    }
    .journey__phase:disabled:not(.journey__phase--active) {
      opacity: 0.55;
    }
    button:focus-visible {
      outline: 2px solid var(--ngx-color-primary);
      outline-offset: 3px;
    }
    @media (max-width: 650px) {
      .journey {
        gap: 0.4rem;
      }
      .journey__phase {
        padding: 0.75rem 0.4rem;
        gap: 0.4rem;
        font-size: 0.8rem;
      }
      small {
        display: none;
      }
    }
  `,
})
export class PublishingJourneyComponent {
  readonly step = input(0);
  readonly hasSource = input(false);
  readonly reviewed = input(false);
  readonly locked = input(false);
  readonly navigate = output<number>();
  readonly phases = [
    { title: 'Workshop brief', detail: 'Set the direction' },
    { title: 'Draft review', detail: 'Explore and refine' },
    { title: 'Publication', detail: 'Approve and confirm' },
  ];
}
