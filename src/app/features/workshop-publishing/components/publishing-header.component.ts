import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxParticleHeader } from '@tmdjr/ngx-shared-headers';

@Component({
  selector: 'ngx-publishing-header',
  imports: [MatIcon, NgxParticleHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header aria-labelledby="publisher-title">
      <ngx-particle-header>
        <div class="publisher-header__hero-content">
          <div class="publisher-header__eyebrow">
            <mat-icon aria-hidden="true">auto_awesome</mat-icon>
            Workshop publishing
          </div>
          <h1 id="publisher-title">{{ title() }}</h1>
          <p>{{ description() }}</p>
        </div>
      </ngx-particle-header>
    </header>
  `,
  styles: [`
    :host, ngx-particle-header { display: block; }
    .publisher-header__hero-content {
      position: relative;
      width: min(100% - 3rem, 1440px);
      margin: 0 auto;
      padding: 2.5rem 0 2.25rem;
      color: var(--mat-sys-on-primary);
    }
    .publisher-header__eyebrow {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      margin-bottom: 0.55rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.13em;
      text-transform: uppercase;
      opacity: 0.8;
    }
    .publisher-header__eyebrow mat-icon { width: 1rem; height: 1rem; font-size: 1rem; }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 4vw, 3.25rem);
      font-weight: 500;
      line-height: 1.05;
      letter-spacing: -0.04em;
    }
    .publisher-header__hero-content p {
      max-width: 48rem;
      margin: 0.75rem 0 0;
      font-size: 1rem;
      line-height: 1.5;
      opacity: 0.78;
    }
    @media (max-width: 700px) {
      .publisher-header__hero-content {
        width: min(100% - 2rem, 1440px);
        padding: 2rem 0;
      }
    }
  `],
})
export class PublishingHeaderComponent {
  readonly title = input('AI Publisher');
  readonly description = input('Track your workshop publishing requests and start something new.');
}
