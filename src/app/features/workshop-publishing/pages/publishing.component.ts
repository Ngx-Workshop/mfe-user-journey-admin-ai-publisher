import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PublishingModelComponent } from '../components/publishing-model.component';
import { PublishingImagesComponent } from '../components/publishing-images.component';
import { PublishingBriefComponent } from '../components/publishing-brief.component';
import { PublishingSourceComponent } from '../components/publishing-source.component';
import { PublishingReviewComponent } from '../components/publishing-review.component';
import { PublishingReceiptsComponent } from '../components/publishing-receipts.component';
import { PublishingHeaderComponent } from '../components/publishing-header.component';
import { PublishingActionsComponent } from '../components/publishing-actions.component';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  selector: 'ngx-workshop-publishing',
  imports: [MatStepperModule, MatButtonModule, MatProgressBarModule, PublishingModelComponent, PublishingImagesComponent, PublishingBriefComponent,
    PublishingSourceComponent, PublishingReviewComponent, PublishingReceiptsComponent,
    PublishingHeaderComponent, PublishingActionsComponent],
  providers: [PublishingViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-header title="New workshop"
      description="Build a workshop with AI, review the learning materials, then publish when you're ready." />
    <ngx-publishing-actions [disabled]="vm.busy() || vm.initializing()" [showBack]="true"
      (back)="back()" (createWorkshop)="restart()" />
    <main class="publisher" aria-labelledby="publisher-title">
      <section class="publisher__workspace" aria-label="AI workshop creation wizard">
        @if (vm.busy()) {
          <mat-progress-bar mode="indeterminate" aria-label="Publishing Agent is working" />
        }
        @if (vm.error() || vm.validation()) {
          <p class="publisher__error" role="alert">{{ vm.error() || vm.validation() }}</p>
        }
        <mat-stepper linear orientation="vertical" [selectedIndex]="vm.step()"
          (selectionChange)="vm.step.set($event.selectedIndex)">
          <mat-step label="Describe your workshop" [completed]="!!vm.draft()" [editable]="!vm.busy() && !vm.attempted()">
            <h2 class="publisher__title">Set the brief</h2>
            <p class="publisher__intro">Choose an AI model and describe the subject, audience and learning objectives.</p>
            <ngx-publishing-model [model]="vm.model" [catalog]="vm.catalog()" [errors]="vm.setupErrors()"
              [locked]="vm.busy() || vm.initializing() || vm.attempted()"
              [reloadDisabled]="vm.busy() || vm.initializing()" (reload)="vm.initialize()" />
            <ngx-publishing-brief [form]="vm.form" [sections]="vm.sections()"
              [locked]="vm.busy() || vm.attempted()" [initializing]="vm.initializing()"
              [modelValid]="vm.model.valid" (generate)="vm.generate()" />
            <ngx-publishing-source [json]="vm.json" [locked]="vm.busy() || vm.attempted()" (validate)="vm.validate()" />
            @if (vm.draft()) {
              <button mat-flat-button type="button" [disabled]="vm.busy()" (click)="vm.step.set(1)">Continue to review</button>
            }
          </mat-step>
          <mat-step label="Review and refine" [completed]="vm.reviewed() && !!vm.draft()" [editable]="!vm.busy() && !vm.attempted()">
            <h2 class="publisher__title">Review the learning materials</h2>
            <p class="publisher__intro">Check the documentation, coding labs and assessment. Optionally add an image or edit the draft.</p>
            <ngx-publishing-images [query]="vm.imageQuery" [prompt]="vm.imagePrompt" [images]="vm.images()"
              [selected]="vm.image()" [imageModel]="vm.catalog()?.imageModel ?? null"
              [locked]="vm.busy() || vm.attempted()" [initializing]="vm.initializing()" [hasDraft]="!!vm.draft()"
              (browse)="vm.browseImages()" (select)="vm.selectImage($event)"
              (generate)="vm.generateImage()" (apply)="vm.applyImage()" />
            <ngx-publishing-source [json]="vm.json" [locked]="vm.busy() || vm.attempted()" (validate)="vm.validate()" />
            @if (vm.draft(); as draft) {
              <ngx-publishing-review [draft]="draft" [locked]="vm.busy() || vm.attempted()" [showPublish]="false" />
            } @else {
              <p role="status">Validate your changes to continue to publication.</p>
            }
            <div class="publisher__navigation">
              <button mat-button type="button" [disabled]="vm.busy() || vm.attempted()" (click)="vm.step.set(0)">Back to brief</button>
              <button mat-flat-button type="button" [disabled]="!vm.draft() || vm.busy() || vm.attempted()"
                (click)="vm.continueToPublish()">Continue to publish</button>
            </div>
          </mat-step>
          <mat-step label="Publish and confirm">
            <h2 class="publisher__title">Publish your workshop</h2>
            @if (vm.draft(); as draft) {
              <p>{{ draft.name }} · {{ draft.pages.length }} documentation pages · {{ draft.labs.length }} coding labs ·
                {{ draft.assessment.testQuestions.length }} assessment questions</p>
            }
            <p>Publishing makes these resources available immediately. Coding labs must pass verification first.</p>
            <div class="publisher__navigation">
              <button mat-button type="button" [disabled]="vm.busy() || vm.attempted()" (click)="vm.step.set(1)">Back to review</button>
              <button mat-flat-button type="button" [disabled]="!vm.draft() || vm.busy() || vm.initializing() || vm.attempted()"
                (click)="vm.publish()">Publish reviewed workshop</button>
            </div>
            <ngx-publishing-receipts [showHistory]="false" [history]="vm.history()" [unconfirmed]="vm.unconfirmedRequests()"
              [requestId]="vm.requestId()" [receiptId]="vm.receiptId" [receipt]="vm.receipt()"
              [busy]="vm.busy()" [initializing]="vm.initializing()" [attempted]="vm.attempted()"
              (inspect)="vm.inspect()" />
          </mat-step>
        </mat-stepper>
      </section>
    </main>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      color: var(--mat-sys-on-surface);
      background:
        radial-gradient(circle at 85% 15%, color-mix(in srgb, var(--mat-sys-primary) 8%, transparent), transparent 28rem),
        var(--mat-sys-surface-container-lowest);
    }
    .publisher {
      width: min(100% - 3rem, 1440px);
      margin: 0 auto;
      padding: 1.5rem 0 3rem;
    }
    .publisher__workspace {
      min-width: 0;
      padding: 1.5rem;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 1rem;
      background: var(--mat-sys-surface-container-lowest);
    }
    .publisher__title { margin: 0; font-size: 1.5rem; font-weight: 500; }
    .publisher__intro {
      margin: 0.75rem 0 1.5rem;
      color: var(--mat-sys-on-surface-variant);
      line-height: 1.5;
    }
    .publisher__navigation { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1.5rem 0; }
    mat-stepper { background: transparent; }
    .publisher__error { color: var(--mat-sys-error); padding: 1rem; }
    @media (max-width: 700px) {
      .publisher { width: min(100% - 2rem, 1440px); padding-top: 1rem; }
      .publisher__workspace { padding: 1rem; }
    }
  `],
})
export class PublishingComponent implements OnInit {
  readonly vm = inject(PublishingViewModel);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  canLeave(): boolean {
    if (this.vm.busy() || this.vm.initializing()) return false;
    if (this.vm.attempted() || (!this.vm.json.value && !this.vm.form.dirty)) return true;
    return window.confirm('Leave this workshop? Your unpublished draft will be discarded.');
  }
  back(): void { void this.router.navigate(['../overview'], { relativeTo: this.route }); }
  restart(): void { if (this.canLeave()) this.vm.newDraft(); }

  ngOnInit(): void {
    this.vm.initialize();
  }
}
