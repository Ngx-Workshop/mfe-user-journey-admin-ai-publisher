import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PublishingHeaderComponent } from '../components/publishing-header.component';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingStatusComponent } from '../components/publishing-status.component';
import { ReceiptViewModel } from './receipt.view-model';

@Component({
  selector: 'ngx-publishing-receipt',
  imports: [JsonPipe, MatButtonModule, MatProgressBarModule, PublishingHeaderComponent,
    PublishingActionsComponent, PublishingStatusComponent],
  providers: [ReceiptViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-header title="Publishing receipt" description="Check the progress and results of your workshop publishing request." />
    <ngx-publishing-actions [showBack]="true" [disabled]="vm.busy()" (back)="back()" (createWorkshop)="createWorkshop()" />
    <main class="receipt" aria-labelledby="publisher-title" [attr.aria-busy]="vm.busy()">
      <section class="receipt__panel" aria-labelledby="receipt-request-title">
        <div class="receipt__heading">
          <h2 id="receipt-request-title">Request details</h2>
          <button mat-stroked-button type="button" [disabled]="vm.busy() || vm.invalid()" (click)="vm.refresh()">Refresh receipt</button>
        </div>
        <p class="receipt__id">{{ vm.requestId() }}</p>
        @if (vm.busy()) {
          <mat-progress-bar mode="indeterminate" aria-label="Loading publishing receipt" />
          <p role="status">Loading receipt…</p>
        }
        @if (vm.error()) {
          <p class="receipt__error" role="alert">{{ vm.error() }}</p>
          @if (!vm.invalid()) { <button mat-button type="button" [disabled]="vm.busy()" (click)="vm.refresh()">Retry</button> }
        }
        @if (vm.receipt(); as receipt) {
          <ngx-publishing-status [status]="receipt.status" />
          @if (receipt.message) { <p>{{ receipt.message }}</p> }
          <p class="receipt__progress">{{ vm.progress() }}</p>
          @if (receipt.status === 'needs_recovery') { <p>Keep this request ID and check its receipt before starting another publish attempt.</p> }
          <h3>Publishing progress</h3>
          <ol class="receipt__steps">
            @for (step of vm.steps(); track $index) {
              <li class="receipt__step">
                <div class="receipt__step-heading"><span>{{ step.label }}</span>
                  <span class="receipt__step-status">{{ step.status === 'complete' ? 'Completed' : 'Pending' }}</span></div>
                @if (step.result !== undefined) {
                  <details><summary>View result details</summary><pre class="receipt__code">{{ step.result | json }}</pre></details>
                }
              </li>
            } @empty { <li>No publishing steps reported yet.</li> }
          </ol>
        }
      </section>
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; color: var(--mat-sys-on-surface);
      background: radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--mat-sys-primary) 8%, transparent), transparent 28rem), var(--mat-sys-surface-container-lowest); }
    .receipt { width: min(100% - 3rem, 1440px); margin: 0 auto; padding: 1.5rem 0 3rem; }
    .receipt__panel { padding: 1.5rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 1rem; }
    .receipt__heading, .receipt__step-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
    .receipt__heading h2 { margin: 0; font-weight: 500; }
    .receipt__id, .receipt__code { overflow-wrap: anywhere; }
    .receipt__code { white-space: pre-wrap; max-height: 32rem; overflow: auto; background: var(--mat-sys-surface-container); padding: 1rem; }
    .receipt__progress, .receipt__step-status { color: var(--mat-sys-on-surface-variant); }
    .receipt__steps { padding-left: 1.5rem; }
    .receipt__step { padding: 1rem 0; border-bottom: 1px solid var(--mat-sys-outline-variant); }
    .receipt__error { color: var(--mat-sys-error); }
    details { margin-top: 0.75rem; } summary { cursor: pointer; }
    @media (max-width: 700px) {
      .receipt { width: min(100% - 2rem, 1440px); padding-top: 1rem; }
      .receipt__panel { padding: 1rem; }
      .receipt__heading, .receipt__step-heading { align-items: flex-start; flex-direction: column; }
    }
  `],
})
export class ReceiptComponent implements OnInit {
  readonly vm = inject(ReceiptViewModel);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => this.vm.load(params.get('requestId') ?? ''));
  }
  back(): void { void this.router.navigate(['../../overview'], { relativeTo: this.route, queryParamsHandling: 'preserve' }); }
  createWorkshop(): void { void this.router.navigate(['../../new'], { relativeTo: this.route }); }
}
