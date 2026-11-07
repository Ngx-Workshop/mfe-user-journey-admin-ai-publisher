import { MatButton, MatAnchor } from '@angular/material/button';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingHistoryComponent } from '../components/publishing-history.component';
import { OverviewViewModel } from './overview.view-model';

@Component({
  host: {
    class: 'ngx-design-system',
    '[style.--publisher-action-bar-height.px]': 'actionBarHeight()',
  },
  selector: 'ngx-publishing-overview',
  imports: [
    MatButton,
    MatAnchor,
    NgxButton,
    DatePipe,
    RouterLink,
    PublishingActionsComponent,
    PublishingHistoryComponent,
  ],
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
      <section class="drafts" aria-label="Your drafts">
        <header>
          <h2>Your drafts</h2>
          <button
            mat-flat-button
            ngxButton
            surface="glass"
            type="button"
            [disabled]="vm.drafts.busy()"
            (click)="vm.refresh()"
          >
            Refresh drafts
          </button>
        </header>
        @if (vm.drafts.error()) {
          <p role="alert">{{ vm.drafts.error() }}</p>
        }
        @for (draft of vm.drafts.rows(); track draft.draftId) {
          <article>
            <div>
              <h3>{{ draft.name }}</h3>
              <p>
                {{ draftStatus(draft.status) }} · Saved
                {{ draft.updatedAt | date: 'medium' }}
              </p>
            </div>
            <a
              mat-flat-button
              ngxButton
              surface="glass"
              [routerLink]="['../new']"
              [queryParams]="{ draft: draft.draftId }"
              >Continue review<span class="sr-only">
                of {{ draft.name }}</span
              ></a
            >
          </article>
        } @empty {
          <p>
            {{
              vm.drafts.busy()
                ? 'Loading your drafts…'
                : 'Your workshop drafts will appear here automatically.'
            }}
          </p>
        }
        @if (vm.drafts.hasMore()) {
          <button
            mat-flat-button
            ngxButton
            surface="glass"
            type="button"
            [disabled]="vm.drafts.busy()"
            (click)="vm.loadMoreDrafts()"
          >
            Load more drafts
          </button>
        }
      </section>
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
        background:
          radial-gradient(
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
      .drafts {
        margin-bottom: 1rem;
        padding: 1.25rem;
        border: 1px solid var(--ngx-color-border);
        border-radius: var(--ngx-radius-lg, 12px);
        background: var(--ngx-color-surface);
      }
      .drafts header,
      .drafts article {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }
      .drafts article {
        padding: 1rem 0;
        border-top: 1px solid var(--ngx-color-border);
      }
      .drafts h2,
      .drafts h3 {
        margin: 0;
      }
      .drafts p {
        color: var(--ngx-color-text-secondary);
      }
      .drafts a {
        white-space: nowrap;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
      }
      @media (max-width: 600px) {
        .drafts article {
          align-items: flex-start;
          flex-direction: column;
        }
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
  draftStatus(status: string): string {
    return (
      (
        {
          running: 'Processing',
          interrupted: 'Interrupted · run checks again',
          ready: 'Ready for review',
          needs_attention: 'Checks need attention',
          edited: 'Edited · run checks again',
        } as Record<string, string>
      )[status] ?? status
    );
  }
  createWorkshop(): void {
    void this.router.navigate(['../new'], { relativeTo: this.route });
  }
}
