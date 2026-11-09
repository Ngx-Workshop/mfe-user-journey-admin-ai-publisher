import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { PublishingSetupComponent } from '../../components/creation/publishing-setup.component';
import { PublishingPreparationComponent } from '../../components/shared/publishing-preparation.component';
import { PublishingRefinement } from './publishing-refinement.component';
import { PublishingViewModel } from './publishing.view-model';

@Component({
  selector: 'ngx-publishing-brief-step',
  imports: [PublishingSetupComponent, PublishingPreparationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-setup
      [model]="vm.model"
      [catalog]="vm.catalog()"
      [errors]="vm.setupErrors()"
      [form]="vm.form"
      [sections]="vm.sections()"
      [locked]="vm.working() || vm.attempted()"
      [initializing]="vm.initializing()"
      [hasChecks]="!!vm.preparation()"
      (generate)="vm.generate()"
      (retry)="vm.initialize()"
      (importSource)="refinement.open('source')"
    >
      @if (vm.preparation(); as report) {
        <ngx-publishing-preparation
          publisherChecks
          [report]="report"
          [embedded]="true"
          [locked]="vm.working() || vm.attempted()"
          (resume)="vm.resumeChecks()"
          [repairOptions]="vm.repairOptions()"
          [repairModel]="vm.model.value"
          (repair)="vm.repair($event)"
        />
      }
    </ngx-publishing-setup>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
  `,
})
export class PublishingBriefStepComponent {
  readonly vm = inject(PublishingViewModel);
  readonly refinement = inject(PublishingRefinement);
}
