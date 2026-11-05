import { NgTemplateOutlet } from '@angular/common';
import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { PublishingSetupComponent } from '../components/publishing-setup.component';
import { PublishingImagesComponent } from '../components/publishing-images.component';
import { PublishingSourceComponent } from '../components/publishing-source.component';
import { PublishingReviewComponent } from '../components/publishing-review.component';
import { PublishingReceiptsComponent } from '../components/publishing-receipts.component';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingJourneyComponent } from '../components/publishing-journey.component';
import { PublishingProgressComponent } from '../components/publishing-progress.component';
import { PublishingConfirmationComponent } from '../components/publishing-confirmation.component';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  host: {
    class: 'ngx-design-system',
    '[style.--publisher-action-height.px]': 'actionBarHeight()',
  },
  selector: 'ngx-workshop-publishing',
  imports: [
    NgxPanel,
    NgTemplateOutlet,
    NgxButton,
    MatButtonModule,
    PublishingSetupComponent,
    PublishingImagesComponent,
    PublishingSourceComponent,
    PublishingReviewComponent,
    PublishingReceiptsComponent,
    PublishingActionsComponent,
    PublishingJourneyComponent,
    PublishingProgressComponent,
    PublishingConfirmationComponent,
  ],
  providers: [PublishingViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-actions
      heading="New workshop"
      [status]="vm.status()"
      (heightChange)="actionBarHeight.set($event)"
      [disabled]="vm.working() || vm.initializing()"
      [showBack]="true"
      (back)="back()"
      (createWorkshop)="restart()"
    />
    <main #workspace class="publisher" aria-label="New workshop">
      <ngx-publishing-journey
        [step]="vm.step()"
        [hasSource]="!!vm.json.value"
        [reviewed]="vm.reviewed() && !!vm.draft()"
        [locked]="vm.working() || vm.initializing() || vm.attempted()"
        (navigate)="vm.navigate($event)"
      />
      @if (vm.step() === 0 && vm.operation() !== 'generate') {
        <ng-container [ngTemplateOutlet]="workspaceContent" />
      } @else {
        <ngx-panel
          [heading]="
            vm.operation() === 'generate'
              ? 'Creating your workshop draft'
              : vm.step() === 0
                ? 'Shape your workshop'
                : vm.step() === 1
                  ? 'Review your workshop'
                  : 'Publish and confirm'
          "
          eyebrow="PUBLISHER / CREATE"
          shape="stepped"
          background="solid"
          class="publisher__workspace"
        >
          <ng-container [ngTemplateOutlet]="workspaceContent" />
        </ngx-panel>
      }
      <ng-template #workspaceContent>
        <h2 #phaseHeading class="publisher__title" tabindex="-1">
          {{
            vm.operation() === 'generate'
              ? 'Creating your workshop'
              : vm.step() === 0
                ? 'Start with a clear brief'
                : vm.step() === 1
                  ? 'Explore the draft before you publish'
                  : 'Your publication checkpoint'
          }}
        </h2>
        @if (vm.error() || vm.validation()) {
          <div class="publisher__error" role="alert">
            <p>{{ vm.error() || vm.validation() }}</p>
            @if (!vm.attempted()) {
              <p>
                Your inputs are preserved.
                {{
                  vm.step() === 0
                    ? 'Review the inputs below, then try again.'
                    : 'Check your draft and validate changes to continue.'
                }}
              </p>
            }
          </div>
        }
        @if (vm.operation() !== 'idle') {
          <ngx-publishing-progress
            [operation]="vm.operation()"
            [elapsed]="vm.elapsed()"
          />
        }
        @if (vm.operation() !== 'generate') {
          @if (vm.step() === 0) {
            <ngx-publishing-setup
              [model]="vm.model"
              [catalog]="vm.catalog()"
              [errors]="vm.setupErrors()"
              [form]="vm.form"
              [sections]="vm.sections()"
              [json]="vm.json"
              [locked]="vm.working() || vm.attempted()"
              [initializing]="vm.initializing()"
              [hasDraft]="!!vm.draft()"
              (generate)="vm.generate()"
              (validate)="vm.validate()"
              (retry)="vm.initialize()"
              (resume)="vm.navigate(1)"
            />
          } @else if (vm.step() === 1) {
            @if (vm.draft(); as draft) {
              <ngx-publishing-review
                [draft]="draft"
                [locked]="vm.working() || vm.attempted()"
                [showPublish]="false"
              />
            } @else {
              <p class="publisher__intro" role="status">
                Your draft has unvalidated edits. Validate the source
                below to restore the preview and continue to
                publication.
              </p>
            }
            <details class="publisher__refine">
              <summary>Refine the draft · images and source</summary>
              <p class="publisher__intro">
                Optional refinements. Changes must be validated before
                publication.
              </p>
              <ngx-publishing-images
                [query]="vm.imageQuery"
                [prompt]="vm.imagePrompt"
                [images]="vm.images()"
                [selected]="vm.image()"
                [imageModel]="vm.catalog()?.imageModel ?? null"
                [locked]="vm.working() || vm.attempted()"
                [initializing]="vm.initializing()"
                [hasDraft]="!!vm.draft()"
                (browse)="vm.browseImages()"
                (select)="vm.selectImage($event)"
                (generate)="vm.generateImage()"
                (apply)="vm.applyImage()"
              />
              <ngx-publishing-source
                [json]="vm.json"
                [locked]="vm.working() || vm.attempted()"
                (validate)="vm.validate()"
              />
            </details>
            <div class="publisher__navigation">
              <button
                mat-button
                ngxButton
                surface="outline"
                type="button"
                [disabled]="vm.working() || vm.attempted()"
                (click)="vm.navigate(0)"
              >
                Back to brief
              </button>
              <button
                mat-flat-button
                ngxButton
                shape="chevron"
                type="button"
                [disabled]="
                  !vm.draft() || vm.working() || vm.attempted()
                "
                (click)="vm.continueToPublish()"
              >
                Continue to publish
              </button>
            </div>
          } @else {
            @if (vm.draft(); as draft) {
              <ngx-publishing-confirmation
                [draft]="draft"
                [locked]="
                  vm.working() || vm.initializing() || vm.attempted()
                "
                [reviewed]="vm.reviewed()"
                (back)="vm.navigate(1)"
                (publish)="vm.publish()"
              />
            }
            <ngx-publishing-receipts
              [showHistory]="false"
              [history]="vm.history()"
              [unconfirmed]="vm.unconfirmedRequests()"
              [requestId]="vm.requestId()"
              [receiptId]="vm.receiptId"
              [receipt]="vm.receipt()"
              [busy]="vm.working()"
              [initializing]="vm.initializing()"
              [attempted]="vm.attempted()"
              (inspect)="vm.inspect()"
            />
          }
        }
      </ng-template>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
      min-height: calc(100dvh - var(--publisher-toolbar-top, 96px));
      color: var(--ngx-color-text);
      background: var(--ngx-color-canvas);
    }
    .publisher {
      width: calc(100% - 2rem);
      margin: 0 auto;
      padding: 1rem 0 2rem;
      scroll-margin-top: calc(
        var(--publisher-toolbar-top, 96px) +
          var(--publisher-action-height, 70px) + 16px
      );
    }
    .publisher__workspace {
      display: block;
      min-width: 0;
    }
    .publisher__title {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .publisher__title:focus {
      outline: none;
    }
    .publisher__intro {
      color: var(--ngx-color-muted);
      line-height: 1.7;
      margin: 0 0 1.5rem;
    }
    .publisher__navigation {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.75rem;
      margin-top: 1.5rem;
    }
    .publisher__error {
      color: var(--ngx-color-error);
      padding: 1rem;
      border-left: 3px solid var(--ngx-color-error);
      margin-bottom: 1rem;
      background: var(--ngx-color-surface);
      overflow-wrap: anywhere;
    }
    .publisher__error p {
      margin: 0.5rem 0;
    }
    .publisher__refine {
      border: 1px solid var(--ngx-color-border);
      padding: 1rem;
      margin-top: 1.5rem;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
      padding: 0.5rem 0;
    }
    .publisher__resume,
    ngx-publishing-progress {
      display: block;
      margin: 1.25rem 0;
    }
  `,
})
export class PublishingComponent implements OnInit {
  readonly actionBarHeight = signal(70);
  readonly vm = inject(PublishingViewModel);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly generating = computed(
    () => this.vm.operation() === 'generate'
  );
  private readonly workspace =
    viewChild<ElementRef<HTMLElement>>('workspace');
  private readonly heading =
    viewChild<ElementRef<HTMLElement>>('phaseHeading');

  constructor() {
    afterRenderEffect(() => {
      this.vm.step();
      this.actionBarHeight();
      const generating = this.generating();
      if (!this.vm.initializing() || generating) {
        this.heading()?.nativeElement.focus({ preventScroll: true });
        this.workspace()?.nativeElement.scrollIntoView({
          block: 'start',
        });
      }
    });
  }
  canLeave(): boolean {
    if (this.vm.working() || this.vm.initializing()) return false;
    if (
      this.vm.attempted() ||
      (!this.vm.json.value && !this.vm.form.dirty)
    )
      return true;
    return window.confirm(
      'Leave this workshop? Your unpublished draft will be discarded.'
    );
  }
  back(): void {
    void this.router.navigate(['../overview'], {
      relativeTo: this.route,
    });
  }
  restart(): void {
    if (this.canLeave()) this.vm.newDraft();
  }
  ngOnInit(): void {
    this.vm.initialize();
  }
}
