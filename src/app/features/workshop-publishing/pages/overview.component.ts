import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PublishingHeaderComponent } from '../components/publishing-header.component';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingHistoryComponent } from '../components/publishing-history.component';
import { OverviewViewModel } from './overview.view-model';

@Component({
  selector: 'ngx-publishing-overview',
  imports: [JsonPipe, MatButtonModule, PublishingHeaderComponent, PublishingActionsComponent, PublishingHistoryComponent],
  providers: [OverviewViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-header />
    <ngx-publishing-actions [disabled]="vm.busy()" (createWorkshop)="createWorkshop()" />
    <main class="overview" aria-labelledby="publisher-title">
      <ngx-publishing-history [rows]="vm.filtered()" [total]="vm.rows().length"
        [search]="vm.search()" [status]="vm.status()" [busy]="vm.busy()" [error]="vm.error()"
        (searchChanged)="vm.search.set($event)" (statusChanged)="vm.status.set($event)"
        (clear)="vm.clearFilters()" (refresh)="vm.refresh()" (inspect)="vm.inspect($event)" />
      @if (vm.receipt(); as receipt) {
        <section class="overview__receipt" role="status" aria-labelledby="receipt-title">
          <button mat-button type="button" (click)="vm.receipt.set(null)">Close receipt</button>
          <h2 id="receipt-title">Publishing receipt</h2>
          <p class="overview__id">{{ receipt.requestId }}</p>
          <p>{{ labels[receipt.status] }} — {{ receipt.message }}</p>
          @for (step of receipt.steps; track $index) {
            <details><summary>{{ step.name }} — {{ step.status }}</summary>
              <pre class="overview__code">{{ step.result | json }}</pre></details>
          }
        </section>
      }
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; color: var(--mat-sys-on-surface);
      background: radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--mat-sys-primary) 8%, transparent), transparent 28rem), var(--mat-sys-surface-container-lowest); }
    .overview { width: min(100% - 3rem, 1440px); margin: 0 auto; padding: 1.5rem 0 3rem; }
    .overview__receipt { margin-top: 1.5rem; padding: 1.5rem; border: 1px solid var(--mat-sys-outline-variant); border-radius: 1rem; }
    .overview__id, .overview__code { overflow-wrap: anywhere; }
    .overview__code { white-space: pre-wrap; max-height: 32rem; overflow: auto; }
    details { margin: 1rem 0; } summary { cursor: pointer; }
    @media (max-width: 700px) { .overview { width: min(100% - 2rem, 1440px); padding-top: 1rem; } }
  `],
})
export class OverviewComponent implements OnInit {
  readonly vm = inject(OverviewViewModel);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly labels = { complete: 'Completed', running: 'Running', needs_recovery: 'Needs attention' };
  ngOnInit(): void { this.vm.refresh(); }
  createWorkshop(): void { void this.router.navigate(['../new'], { relativeTo: this.route }); }
}
