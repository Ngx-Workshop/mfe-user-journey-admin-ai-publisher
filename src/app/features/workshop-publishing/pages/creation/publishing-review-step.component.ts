import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  model,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { PublishingChecksPanelComponent } from '../../components/creation/publishing-checks-panel.component';
import { PublishingPreparationComponent } from '../../components/shared/publishing-preparation.component';
import { PublishingRepairReviewComponent } from '../../components/creation/publishing-repair-review.component';
import {
  PreviewSection,
  PublishingReviewTabsComponent,
} from '../../components/creation/publishing-review-tabs.component';
import { PublishingReviewComponent } from '../../components/creation/publishing-review.component';
import { PublishingRefinement } from './publishing-refinement.component';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  selector: 'ngx-publishing-review-step',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    NgxButton,
    NgxPanel,
    PublishingChecksPanelComponent,
    PublishingPreparationComponent,
    PublishingRepairReviewComponent,
    PublishingReviewTabsComponent,
    PublishingReviewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="publisher__review-layout">
      @if (vm.draft(); as draft) {
        <ngx-publishing-review-tabs
          class="publisher__material-tabs"
          [draft]="draft"
          panelId="publisher-material-preview"
          [vertical]="verticalTabs()"
          [(section)]="section"
          [showOutline]="true"
          [(selected)]="selected"
        />
      }
      <div class="publisher__preview-column">
        @if (vm.previousRepair()) {
          <ngx-publishing-repair-review
            [changes]="vm.repairChanges()"
            [locked]="vm.working() || vm.attempted()"
            (restore)="vm.restorePreviousDraft()"
          />
        }
        <ngx-panel
          class="publisher__preview"
          shape="stepped"
          background="solid"
          [heading]="vm.draft()?.name ?? 'Workshop Preview'"
          [eyebrow]="
            vm.draft()
              ? 'WORKSHOP PREVIEW / LEVEL ' + vm.draft()!.level
              : 'WORKSHOP PREVIEW'
          "
        >
          <button
            ngxPanelHeader
            mat-icon-button
            type="button"
            aria-label="Refine the draft"
            matTooltip="Refine the draft"
            [disabled]="vm.working() || vm.attempted()"
            (click)="refinement.open('refine')"
          >
            <mat-icon>tune</mat-icon>
          </button>
          @if (vm.draft(); as draft) {
            <ngx-publishing-review
              [draft]="draft"
              [locked]="vm.working() || vm.attempted()"
              [showPublish]="false"
              [showTabs]="false"
              [showOutline]="false"
              [(selected)]="selected"
              [showIdentity]="false"
              panelId="publisher-material-preview"
              [(section)]="section"
            />
          } @else {
            <p class="publisher__intro" role="status">
              Your draft has unvalidated edits. Open Refine the draft
              and validate changes to restore the preview.
            </p>
            <button
              mat-button
              ngxButton
              type="button"
              [disabled]="vm.working()"
              (click)="refinement.open('refine')"
            >
              Refine the draft
            </button>
          }
        </ngx-panel>
      </div>
      <ngx-publishing-checks-panel class="publisher__checks">
        @if (vm.preparation(); as report) {
          <ngx-publishing-preparation
            [report]="report"
            [compact]="true"
            [showHeading]="false"
            [embedded]="true"
            [locked]="vm.working() || vm.attempted()"
            (resume)="vm.resumeChecks()"
            [repairOptions]="vm.repairOptions()"
            [repairModel]="vm.model.value"
            (repair)="vm.repair($event)"
          />
        } @else {
          <p>
            Validate your draft to run checks and restore the preview.
          </p>
        }
        <button
          publisherChecksActions
          mat-flat-button
          ngxButton
          shape="chevron"
          type="button"
          [disabled]="
            !vm.draft() ||
            !vm.checksReady() ||
            vm.working() ||
            vm.attempted()
          "
          (click)="vm.continueToPublish()"
        >
          Continue to publish
        </button>
      </ngx-publishing-checks-panel>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .publisher__review-layout {
      display: grid;
      grid-template-columns: 260px minmax(0, 1fr) minmax(
          280px,
          320px
        );
      grid-template-areas: 'tabs preview checks';
      margin-top: -1rem;
      gap: 1rem;
      align-items: start;
    }
    .publisher__preview-column {
      grid-area: preview;
      min-width: 0;
      padding-top: 1rem;
    }
    .publisher__preview {
      min-width: 0;
    }
    .publisher__intro {
      color: var(--ngx-color-muted);
      line-height: 1.7;
      margin: 0 0 1.5rem;
    }
    .publisher__material-tabs {
      --review-tabs-margin: 0;
      grid-area: tabs;
      max-height: calc(
        100dvh - var(--publisher-sticky-top) - var(
            --publisher-action-height,
            70px
          ) -
          16px
      );
      overflow: auto;
      scrollbar-width: thin;
      position: sticky;
      top: calc(
        var(--publisher-sticky-top) +
          var(--publisher-action-height, 70px)
      );
      z-index: 2;
      background: var(--ngx-color-canvas);
    }
    .publisher__checks {
      grid-area: checks;
      height: max(
        0px,
        calc(
          100dvh - var(--publisher-sticky-top) - var(
              --publisher-action-height,
              70px
            ) -
            32px
        )
      );
      display: block;
      min-width: 0;
      margin-top: 1rem;
      position: sticky;
      top: calc(
        var(--publisher-sticky-top) +
          var(--publisher-action-height, 70px) + 16px
      );
      font-size: 0.8rem;
    }
    @media (max-width: 1100px) {
      .publisher__review-layout {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: 'tabs' 'preview' 'checks';
      }
      .publisher__material-tabs {
        max-height: min(
          300px,
          calc(
            100dvh - var(--publisher-sticky-top) - var(
                --publisher-action-height,
                70px
              ) -
              16px
          )
        );
      }
      .publisher__preview-column {
        padding-top: 0;
      }
      .publisher__checks {
        margin-top: 0;
        position: static;
      }
    }
  `,
})
export class PublishingReviewStepComponent {
  readonly vm = inject(PublishingViewModel);
  readonly refinement = inject(PublishingRefinement);
  readonly selected = model(0);
  readonly section = model<PreviewSection>('pages');
  readonly verticalTabs = signal(true);

  constructor() {
    const media = window.matchMedia('(min-width: 1101px)');
    const update = () => this.verticalTabs.set(media.matches);
    update();
    media.addEventListener('change', update);
    inject(DestroyRef).onDestroy(() =>
      media.removeEventListener('change', update)
    );
  }
}
