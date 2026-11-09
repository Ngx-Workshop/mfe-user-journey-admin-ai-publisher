import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { PublishingActionsComponent } from '../../components/shared/publishing-actions.component';
import { PublishingJourneyComponent } from '../../components/creation/publishing-journey.component';
import { PublishingProgressComponent } from '../../components/creation/publishing-progress.component';
import { PreviewSection } from '../../components/creation/publishing-review-tabs.component';
import { PublishingBriefStepComponent } from './publishing-brief-step.component';
import { PublishingReviewStepComponent } from './publishing-review-step.component';
import { PublishingPublicationStepComponent } from './publishing-publication-step.component';
import { PublishingRefinement } from './publishing-refinement.component';
import { DraftPersistenceViewModel } from './draft-persistence.view-model';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  host: {
    class: 'ngx-design-system',
    '[style.--publisher-action-height.px]': 'actionBarHeight()',
  },
  selector: 'ngx-workshop-publishing',
  imports: [
    MatButtonModule,
    NgxButton,
    PublishingActionsComponent,
    PublishingJourneyComponent,
    PublishingProgressComponent,
    PublishingBriefStepComponent,
    PublishingReviewStepComponent,
    PublishingPublicationStepComponent,
  ],
  providers: [
    DraftPersistenceViewModel,
    PublishingViewModel,
    PublishingRefinement,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-actions
      [journeyHeading]="true"
      [status]="vm.status()"
      (heightChange)="actionBarHeight.set($event)"
      [disabled]="vm.working() || vm.initializing()"
      [showBack]="true"
      (back)="back()"
      [showCreate]="false"
    >
      <ngx-publishing-journey
        publisherJourney
        [step]="vm.step()"
        [hasSource]="!!vm.json.value"
        [reviewed]="vm.reviewed() && !!vm.draft()"
        [locked]="vm.working() || vm.initializing() || vm.attempted()"
        (navigate)="vm.navigate($event)"
      />
    </ngx-publishing-actions>
    <main #workspace class="publisher" aria-label="New workshop">
      <h1 #phaseHeading class="publisher__title" tabindex="-1">
        {{
          generating()
            ? 'Creating your workshop'
            : vm.step() === 0
              ? 'Start with a clear brief'
              : vm.step() === 1
                ? 'Explore the draft before you publish'
                : 'Your publication checkpoint'
        }}
      </h1>
      @if (vm.savedDraftId()) {
        <p class="publisher__saved" role="status">
          {{
            vm.saving()
              ? 'Saving changes…'
              : vm.unsaved()
                ? 'Unsaved changes'
                : 'Draft saved · return anytime from Request history'
          }}
        </p>
      }
      @if (vm.saveError()) {
        <div class="publisher__error" role="alert">
          {{ vm.saveError() }}
          <button
            mat-button
            ngxButton
            type="button"
            [disabled]="vm.working()"
            (click)="vm.retrySave()"
          >
            Retry save
          </button>
        </div>
      }
      @if (vm.error() || vm.validation()) {
        <div class="publisher__error" role="alert">
          <p>{{ vm.error() || vm.validation() }}</p>
          @if (!vm.attempted()) {
            <p>
              Your inputs are preserved.
              {{
                vm.step() === 0
                  ? 'Review the inputs below, then try again.'
                  : vm.repairOptions()?.activities?.length
                    ? 'Use Fix with AI beside a failed check, or refine and validate the draft.'
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
      } @else {
        @switch (vm.step()) {
          @case (0) {
            <ngx-publishing-brief-step />
          }
          @case (1) {
            <ngx-publishing-review-step
              [(selected)]="reviewItem"
              [(section)]="reviewSection"
            />
          }
          @case (2) {
            <ngx-publishing-publication-step />
          }
        }
      }
    </main>
  `,
  styles: `
    :host {
      --publisher-sticky-top: var(--publisher-toolbar-top, 96px);
      display: block;
      min-height: calc(100dvh - var(--publisher-sticky-top));
      color: var(--ngx-color-text);
      background: var(--ngx-color-canvas);
    }
    .publisher {
      width: calc(100% - 2rem);
      margin: 0 auto;
      padding: 1rem 0 2rem;
      scroll-margin-top: calc(
        var(--publisher-sticky-top) +
          var(--publisher-action-height, 70px) + 16px
      );
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
    .publisher__saved {
      margin: 0 0 1rem;
      color: var(--ngx-color-muted);
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
    ngx-publishing-progress {
      display: block;
      margin: 1.25rem 0;
    }
    @media (max-width: 720px) {
      :host {
        --publisher-sticky-top: var(--publisher-toolbar-top, 76px);
      }
    }
  `,
})
export class PublishingComponent implements OnInit {
  readonly actionBarHeight = signal(70);
  readonly reviewItem = signal(0);
  readonly reviewSection = signal<PreviewSection>('pages');
  readonly vm = inject(PublishingViewModel);
  readonly generating = computed(
    () => this.vm.operation() === 'generate'
  );
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private redirectedReceiptId: string | null = null;
  private readonly workspace =
    viewChild<ElementRef<HTMLElement>>('workspace');
  private readonly heading =
    viewChild<ElementRef<HTMLElement>>('phaseHeading');

  constructor() {
    const warn = (event: BeforeUnloadEvent) => {
      if (this.vm.unsaved() || this.vm.saving()) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warn);
    inject(DestroyRef).onDestroy(() =>
      window.removeEventListener('beforeunload', warn)
    );
    effect(() => {
      if (this.vm.draft()) {
        this.reviewItem.set(0);
        this.reviewSection.set('pages');
      }
    });
    effect(() => {
      const id = this.vm.savedDraftId();
      if (id && this.route.snapshot.queryParamMap.get('draft') !== id)
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { draft: id },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
    });
    effect(() => {
      const receipt = this.vm.receipt();
      if (
        !receipt ||
        receipt.status === 'running' ||
        !this.vm.attempted() ||
        this.vm.working() ||
        this.vm.initializing() ||
        receipt.requestId !== this.vm.requestId() ||
        this.redirectedReceiptId === receipt.requestId
      )
        return;
      this.redirectedReceiptId = receipt.requestId;
      void this.router.navigate(['../requests', receipt.requestId], {
        relativeTo: this.route,
      });
    });
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
    if (this.vm.savedDraftId() && !this.vm.unsaved()) return true;
    if (
      this.vm.attempted() ||
      (!this.vm.json.value && !this.vm.form.dirty)
    )
      return true;
    return window.confirm(
      'Leave this workshop? Unsaved changes will be discarded.'
    );
  }
  back(): void {
    void this.router.navigate(['../overview'], {
      relativeTo: this.route,
    });
  }
  ngOnInit(): void {
    this.vm.initialize(
      this.route.snapshot.queryParamMap.get('draft') ?? undefined
    );
  }
}
