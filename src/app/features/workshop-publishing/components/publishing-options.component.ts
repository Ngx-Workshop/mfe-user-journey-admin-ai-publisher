import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PublishingViewModel } from '../pages/publishing.view-model';
import { PublishingModelComponent } from './publishing-model.component';
import { PublishingImagesComponent } from './publishing-images.component';

@Component({
  selector: 'ngx-publishing-options',
  imports: [PublishingModelComponent, PublishingImagesComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ngx-publishing-model [model]="vm.model" [catalog]="vm.catalog()" [errors]="vm.setupErrors()"
      [locked]="vm.busy() || vm.initializing() || vm.attempted()"
      [reloadDisabled]="vm.busy() || vm.initializing()" (reload)="vm.initialize()" />
    <ngx-publishing-images [query]="vm.imageQuery" [prompt]="vm.imagePrompt" [images]="vm.images()"
      [selected]="vm.image()" [imageModel]="vm.catalog()?.imageModel ?? null"
      [locked]="vm.busy() || vm.attempted()" [initializing]="vm.initializing()" [hasDraft]="!!vm.draft()"
      (browse)="vm.browseImages()" (select)="vm.selectImage($event)"
      (generate)="vm.generateImage()" (apply)="vm.applyImage()" />
  `,
  styles: [`:host { display: block; }`],
})
export class PublishingOptionsComponent {
  readonly vm = inject(PublishingViewModel);
}
