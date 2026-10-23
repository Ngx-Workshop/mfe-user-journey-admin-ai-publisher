import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublishingHeaderComponent } from '../components/publishing-header.component';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingHistoryComponent } from '../components/publishing-history.component';
import { OverviewViewModel } from './overview.view-model';

@Component({
  selector: 'ngx-publishing-overview',
  imports: [ PublishingHeaderComponent, PublishingActionsComponent, PublishingHistoryComponent],
  providers: [OverviewViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-header />
    <ngx-publishing-actions [disabled]="vm.busy()" (createWorkshop)="createWorkshop()" />
    <main class="overview" aria-labelledby="publisher-title">
      <ngx-publishing-history [rows]="vm.filtered()" [total]="vm.rows().length"
        [search]="vm.search()" [status]="vm.status()" [busy]="vm.busy()" [error]="vm.error()"
        (searchChanged)="vm.search.set($event)" (statusChanged)="vm.status.set($event)"
        (clear)="vm.clearFilters()" (refresh)="vm.refresh()" (inspect)="inspect($event)" />
    </main>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; color: var(--mat-sys-on-surface);
      background: radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--mat-sys-primary) 8%, transparent), transparent 28rem), var(--mat-sys-surface-container-lowest); }
    .overview { width: min(100% - 3rem, 1440px); margin: 0 auto; padding: 1.5rem 0 3rem; }
    @media (max-width: 700px) { .overview { width: min(100% - 2rem, 1440px); padding-top: 1rem; } }
  `],
})
export class OverviewComponent implements OnInit {
  readonly vm = inject(OverviewViewModel);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.vm.search.set(this.route.snapshot.queryParamMap.get('search') ?? '');
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'complete' || status === 'running' || status === 'needs_recovery' || status === 'unconfirmed') {
      this.vm.status.set(status);
    }
    this.vm.refresh();
  }
  inspect(id: string): void {
    void this.router.navigate(['../requests', id], { relativeTo: this.route,
      queryParams: { search: this.vm.search() || null, status: this.vm.status() === 'all' ? null : this.vm.status() } });
  }
  createWorkshop(): void { void this.router.navigate(['../new'], { relativeTo: this.route }); }
}
