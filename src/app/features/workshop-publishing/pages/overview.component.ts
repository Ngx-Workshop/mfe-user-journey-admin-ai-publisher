import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingHistoryComponent } from '../components/publishing-history.component';
import { OverviewViewModel } from './overview.view-model';

@Component({
  host: {
    class: 'ngx-design-system',
    '[style.--publisher-action-bar-height.px]': 'actionBarHeight()',
  },
  selector: 'ngx-publishing-overview',
  imports: [PublishingActionsComponent, PublishingHistoryComponent],
  providers: [OverviewViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-actions
      heading="AI Publisher"
      (heightChange)="actionBarHeight.set($event)"
      [disabled]="vm.busy()"
      (createWorkshop)="createWorkshop()"
    />
    <main class="overview" aria-label="AI Publisher">
      <ngx-publishing-history
        [rows]="vm.filtered()"
        [allRows]="vm.rows()"
        [total]="vm.rows().length"
        [search]="vm.search()"
        [status]="vm.status()"
        [busy]="vm.busy()"
        [error]="vm.error()"
        (searchChanged)="vm.search.set($event)"
        (statusChanged)="vm.status.set($event)"
        (clear)="vm.clearFilters()"
        (refresh)="vm.refresh()"
        (inspect)="inspect($event)"
      />
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
        min-height: calc(100dvh - var(--publisher-toolbar-top, 96px));
        color: var(--ngx-color-text);
        background: radial-gradient(
            circle at 85% 15%,
            color-mix(
              in srgb,
              var(--ngx-color-primary) 8%,
              transparent
            ),
            transparent 28rem
          ),
          var(--ngx-color-canvas);
      }
      .overview {
        width: calc(100% - 2rem);
        margin: 0 auto;
        padding-top: 12px;
      }
      @media (max-width: 700px) {
        .overview {
          width: calc(100% - 2rem);
          padding-top: 1rem;
        }
      }
    `,
  ],
})
export class OverviewComponent implements OnInit {
  readonly actionBarHeight = signal(56);
  readonly vm = inject(OverviewViewModel);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.vm.search.set(
      this.route.snapshot.queryParamMap.get('search') ?? ''
    );
    const status = this.route.snapshot.queryParamMap.get('status');
    if (
      status === 'complete' ||
      status === 'running' ||
      status === 'needs_recovery' ||
      status === 'unconfirmed'
    ) {
      this.vm.status.set(status);
    }
    this.vm.refresh();
  }
  inspect(id: string): void {
    void this.router.navigate(['../requests', id], {
      relativeTo: this.route,
      queryParams: {
        search: this.vm.search() || null,
        status: this.vm.status() === 'all' ? null : this.vm.status(),
      },
    });
  }
  createWorkshop(): void {
    void this.router.navigate(['../new'], { relativeTo: this.route });
  }
}
