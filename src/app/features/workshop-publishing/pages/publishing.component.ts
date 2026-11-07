import { PublishingRepairReviewComponent } from '../components/publishing-repair-review.component';
import { PublishingPreparationComponent } from '../components/publishing-preparation.component';
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
  DestroyRef,
  inject,
  OnInit,
  signal,
  effect,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatDialogModule,
    MatIconModule,
    MatTooltipModule,
    PublishingSetupComponent,
    PublishingImagesComponent,
    PublishingSourceComponent,
    PublishingReviewComponent,
    PublishingReceiptsComponent,
    PublishingActionsComponent,
    PublishingJourneyComponent,
    PublishingProgressComponent,
    PublishingPreparationComponent,
    PublishingRepairReviewComponent,
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
      @if ((vm.step() === 0 || vm.step() === 1) && vm.operation() !== 'generate') {
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
        }
        @if (vm.step() !== 1 && vm.preparation(); as report) {
          <ngx-publishing-preparation [report]="report" [locked]="vm.working() || vm.attempted()" (resume)="vm.resumeChecks()"
            [repairOptions]="vm.repairOptions()" [repairModel]="vm.model.value" (repair)="vm.repair($event)" />
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
            <div class="publisher__review-layout">
              <aside class="publisher__checks" aria-label="Checks">
                @if (vm.preparation(); as report) {
                  <ngx-publishing-preparation [report]="report" [compact]="true"
                    [locked]="vm.working() || vm.attempted()" (resume)="vm.resumeChecks()"
            [repairOptions]="vm.repairOptions()" [repairModel]="vm.model.value" (repair)="vm.repair($event)" />
                } @else {
                  <h2>Checks</h2>
                  <p>Validate your draft to run checks and restore the preview.</p>
                }
              </aside>
              <div class="publisher__preview-column">
                @if (vm.previousRepair()) {
                  <ngx-publishing-repair-review [changes]="vm.repairChanges()"
                    [locked]="vm.working() || vm.attempted()"
                    (restore)="vm.restorePreviousDraft()" />
                }
              <ngx-panel heading="Workshop Preview" eyebrow="DRAFT REVIEW"
                shape="stepped" background="solid" class="publisher__preview">
                <button ngxPanelHeader mat-icon-button type="button"
                  aria-label="Refine the draft" matTooltip="Refine the draft"
                  [disabled]="vm.working() || vm.attempted()" (click)="openRefine()">
                  <mat-icon>tune</mat-icon>
                </button>
                @if (vm.draft(); as draft) {
                  <ngx-publishing-review [draft]="draft"
                    [locked]="vm.working() || vm.attempted()" [showPublish]="false" />
                } @else {
                  <p class="publisher__intro" role="status">
                    Your draft has unvalidated edits. Open Refine the draft and validate changes to restore the preview.
                  </p>
                  <button mat-button ngxButton type="button" [disabled]="vm.working()"
                    (click)="openRefine()">Refine the draft</button>
                }
              </ngx-panel>
              </div>
            </div>
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
                  !vm.draft() || !vm.checksReady() || vm.working() || vm.attempted()
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
      <ng-template #refineDialog>
        <div class="publisher__dialog ngx-design-system">
          <h2 mat-dialog-title>Refine the draft</h2>
          <mat-dialog-content>
            <p>Choose a workshop image or edit the source. Validate changes before publication.</p>
            @if (vm.error() || vm.validation()) {
              <p class="publisher__error" role="alert">{{ vm.error() || vm.validation() }}</p>
            }
            @if (vm.working()) {
              <ngx-publishing-progress [operation]="vm.operation()" [elapsed]="vm.elapsed()" />
            }
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
          </mat-dialog-content>
          <mat-dialog-actions align="end">
            <button mat-button ngxButton type="button" [disabled]="vm.working()" (click)="closeRefine()">Done</button>
          </mat-dialog-actions>
        </div>
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
    .publisher__preview-column { min-width: 0; }
    .publisher__review-layout {
      display: grid;
      grid-template-columns: minmax(260px, 310px) minmax(0, 1fr);
      gap: 1rem;
      align-items: start;
    }
    .publisher__checks {
      position: sticky;
      top: calc(var(--publisher-toolbar-top, 96px) + var(--publisher-action-height, 70px) + 16px);
      max-height: calc(100dvh - var(--publisher-toolbar-top, 96px) - var(--publisher-action-height, 70px) - 32px);
      overflow: auto;
      scrollbar-width: thin;
      border: 1px solid var(--ngx-color-border);
      background: var(--ngx-color-surface);
      padding: 1rem;
      font-size: .8rem;
    }
    .publisher__preview { min-width: 0; }
    .publisher__dialog { color: var(--ngx-color-text); background: var(--ngx-color-surface); }
    @media (max-width: 960px) {
      .publisher__review-layout { grid-template-columns: minmax(0, 1fr); }
      .publisher__checks { position: static; max-height: 360px; }
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
  private readonly dialog = inject(MatDialog);
  private readonly refineTemplate = viewChild<TemplateRef<unknown>>('refineDialog');
  private refineRef: MatDialogRef<unknown> | undefined;
  openRefine(): void {
    const template = this.refineTemplate();
    if (!template || this.refineRef || this.vm.working() || this.vm.attempted()) return;
    this.refineRef = this.dialog.open(template, { width: '960px', maxWidth: 'calc(100vw - 2rem)', maxHeight: '90dvh', ariaLabel: 'Refine the draft', autoFocus: 'dialog', delayFocusTrap: false });
    this.refineRef.afterClosed().subscribe(() => { this.refineRef = undefined; });
  }
  closeRefine(): void { if (!this.vm.working()) this.refineRef?.close(); }
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
    inject(DestroyRef).onDestroy(() => this.refineRef?.close());
    effect(() => {
      const working = this.vm.working();
      if (this.refineRef) this.refineRef.disableClose = working;
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
