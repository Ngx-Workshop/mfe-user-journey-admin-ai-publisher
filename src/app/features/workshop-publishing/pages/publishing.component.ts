import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PublishingOptionsComponent } from '../components/publishing-options.component';
import { PublishingBriefComponent } from '../components/publishing-brief.component';
import { PublishingSourceComponent } from '../components/publishing-source.component';
import { PublishingReviewComponent } from '../components/publishing-review.component';
import { PublishingReceiptsComponent } from '../components/publishing-receipts.component';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  selector: 'ngx-workshop-publishing',
  imports: [MatProgressBarModule, PublishingOptionsComponent, PublishingBriefComponent,
    PublishingSourceComponent, PublishingReviewComponent, PublishingReceiptsComponent],
  providers: [PublishingViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="publisher" aria-labelledby="publisher-title">
      <p class="publisher__eyebrow">CREATE A WORKSHOP</p>
      <h2 id="publisher-title">Work with your Publishing Agent</h2>
      <p>Describe the subject, audience and learning objectives. Review the documentation,
        coding labs and assessment before publishing.</p>
      <p>Publishing uses your administrator sign-in.</p>
      <ngx-publishing-options />
      <ngx-publishing-brief [form]="vm.form" [sections]="vm.sections()"
        [locked]="vm.busy() || vm.attempted()" [initializing]="vm.initializing()"
        [modelValid]="vm.model.valid" (generate)="vm.generate()" />
      @if (vm.busy()) {
        <mat-progress-bar mode="indeterminate" aria-label="Publishing Agent is working" />
      }
      @if (vm.error() || vm.validation()) {
        <p class="publisher__error" role="alert">{{ vm.error() || vm.validation() }}</p>
      }
      <ngx-publishing-source [json]="vm.json" [locked]="vm.busy() || vm.attempted()" (validate)="vm.validate()" />
      @if (vm.draft(); as draft) {
        <ngx-publishing-review [draft]="draft" [locked]="vm.busy() || vm.attempted()" (publish)="vm.publish()" />
      }
      <ngx-publishing-receipts [history]="vm.history()" [unconfirmed]="vm.unconfirmedRequests()"
        [requestId]="vm.requestId()" [receiptId]="vm.receiptId" [receipt]="vm.receipt()"
        [busy]="vm.busy()" [initializing]="vm.initializing()" [attempted]="vm.attempted()"
        (refresh)="vm.loadHistory()" (inspect)="vm.inspect()" (inspectHistory)="vm.inspectHistory($event)"
        (newDraft)="vm.newDraft()" />
    </section>
  `,
  styles: [`
    .publisher {
      padding: 1.5rem;
      margin: 1.5rem 0;
      border: 1px solid var(--mat-sys-outline-variant);
      border-radius: 1rem;
      background: var(--mat-sys-surface-container-lowest);
    }
    .publisher__eyebrow { color: var(--mat-sys-primary); font-size: 0.75rem; letter-spacing: 0.1em; }
    .publisher__error { color: var(--mat-sys-error); padding: 1rem; }
    @media (max-width: 600px) { .publisher { padding: 1rem; } }
  `],
})
export class PublishingComponent implements OnInit {
  readonly vm = inject(PublishingViewModel);

  ngOnInit(): void {
    this.vm.initialize();
  }
}
