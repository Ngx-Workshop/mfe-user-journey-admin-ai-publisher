import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PublishingComponent } from './features/workshop-publishing/pages/publishing.component';

@Component({
  selector: 'mfe-user-journey-admin-ai-publisher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PublishingComponent],
  template: `
    <main class="publisher-page">
      <header class="publisher-page__header">
        <p class="publisher-page__eyebrow">NGX WORKSHOP / AI PUBLISHER</p>
        <h1>Create and publish workshops.</h1>
        <p class="publisher-page__intro">
          Create learning materials with your Publishing Agent.
        </p>
        <span class="publisher-page__badge">AI workshop publisher</span>
      </header>
      <ngx-workshop-publishing />
    </main>
  `,
  styles: [`
    :host { display: block; color: var(--mat-sys-on-surface, #202a34); background: var(--mat-sys-surface, #f8fafb); }
    .publisher-page { max-width: 1240px; margin: auto; padding: 2.5rem; }
    .publisher-page__header { margin-bottom: 2rem; }
    .publisher-page__eyebrow { font-size: 0.68rem; letter-spacing: 0.16em; font-weight: 700; color: var(--mat-sys-primary, #006879); }
    h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); letter-spacing: -0.045em; margin: 0; }
    .publisher-page__intro { color: var(--mat-sys-on-surface-variant, #566573); line-height: 1.6; }
    .publisher-page__badge { display: inline-block; border-radius: 2rem; padding: 0.5rem 0.8rem; font-size: 0.75rem; background: var(--mat-sys-secondary-container, #e2f0ef); color: var(--mat-sys-on-secondary-container, #24544f); }
    @media (max-width: 760px) { .publisher-page { padding: 1rem; } }
  `],
})
export class App {}
export default App;
