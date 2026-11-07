import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';

@Component({
  selector: 'ngx-publishing-repair-review',
  imports: [MatButtonModule, NgxButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="repair-review" aria-label="AI repair changes">
      <h3>{{ locked() ? 'Fixing the draft with AI' : 'Review AI changes' }}</h3>
      @if (locked()) {
        <p>Your previous draft stays visible while one revision and its checks run.</p>
      } @else {
        <p>AI may change related materials. Review this draft before approving publication.</p>
        <ul>
          @for (change of changes(); track change) { <li>{{ change }}</li> }
          @empty { <li>No material content differences detected. Read the check results.</li> }
        </ul>
      }
      <button mat-button ngxButton surface="outline" type="button"
        [disabled]="locked()" (click)="restore.emit()">Restore previous draft</button>
    </section>
  `,
  styles: `
    .repair-review { padding: 1rem; margin-bottom: 1rem; border: 1px solid var(--ngx-color-border); background: var(--ngx-color-surface); overflow-wrap: anywhere; }
    h3 { margin-top: 0; }
    p, li { line-height: 1.5; }
    ul { padding-left: 1.25rem; }
  `,
})
export class PublishingRepairReviewComponent {
  readonly changes = input<string[]>([]);
  readonly locked = input(false);
  readonly restore = output<void>();
}
