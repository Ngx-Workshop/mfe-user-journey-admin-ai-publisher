import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxBackground,
  NgxButton,
  NgxEntrance,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { PublishingConfirmationComponent } from '../../components/creation/publishing-confirmation.component';
import { PublishingReceiptsComponent } from '../../components/creation/publishing-receipts.component';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  selector: 'ngx-publishing-publication-step',
  imports: [
    MatButtonModule,
    NgxBackground,
    NgxButton,
    NgxEntrance,
    NgxPanel,
    PublishingConfirmationComponent,
    PublishingReceiptsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="publisher__publication-layout">
      <ngx-background placement="viewport" />
      <ngx-panel
        class="publisher__publication"
        heading="Publish and confirm"
        eyebrow="PUBLISHER / CREATE"
        shape="stepped"
        background="glass"
        ngxEntrance="fade"
      >
        @if (vm.draft(); as draft) {
          <ngx-publishing-confirmation
            [draft]="draft"
            [locked]="
              vm.working() || vm.initializing() || vm.attempted()
            "
            [reviewed]="vm.reviewed()"
            [showActions]="false"
          />
        }
        <ngx-publishing-receipts
          [showHistory]="false"
          [showLookup]="false"
          [history]="vm.history()"
          [unconfirmed]="vm.unconfirmedRequests()"
          [requestId]="vm.requestId()"
          [receiptId]="vm.receiptId"
          [receipt]="vm.receipt()"
          [busy]="vm.working()"
          [initializing]="vm.initializing()"
          [attempted]="vm.attempted()"
        />
        <div ngxPanelActions class="publisher__publication-actions">
          <button
            mat-button
            ngxButton
            surface="outline"
            type="button"
            [disabled]="
              vm.working() || vm.initializing() || vm.attempted()
            "
            (click)="vm.navigate(1)"
          >
            Back to review
          </button>
          <button
            mat-flat-button
            ngxButton
            shape="chevron"
            type="button"
            [disabled]="
              !vm.draft() ||
              !vm.reviewed() ||
              !vm.checksReady() ||
              vm.working() ||
              vm.initializing() ||
              vm.attempted()
            "
            (click)="vm.publish()"
          >
            Publish reviewed workshop
          </button>
        </div>
      </ngx-panel>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .publisher__publication-layout {
      position: relative;
      isolation: isolate;
      box-sizing: border-box;
      width: 100%;
      max-width: 765px;
      min-width: 0;
      margin-inline: auto;
    }
    .publisher__publication {
      display: block;
      min-width: 0;
      height: auto;
    }
    .publisher__publication-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      width: 100%;
      gap: 0.75rem;
    }
  `,
})
export class PublishingPublicationStepComponent {
  readonly vm = inject(PublishingViewModel);
}
