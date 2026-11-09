import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injectable,
  Injector,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { NgxButton } from '@tmdjr/ngx-workshop-design-system';
import { PublishingImagesComponent } from '../../components/creation/publishing-images.component';
import { PublishingSourceComponent } from '../../components/creation/publishing-source.component';
import { PublishingProgressComponent } from '../../components/creation/publishing-progress.component';
import { PublishingViewModel } from './publishing.view-model';

type RefinementMode = 'source' | 'refine';

@Injectable()
export class PublishingRefinement {
  private readonly dialog = inject(MatDialog);
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);
  private readonly vm = inject(PublishingViewModel);
  private ref?: MatDialogRef<PublishingRefinementComponent>;

  constructor() {
    this.destroyRef.onDestroy(() => this.ref?.close());
  }
  open(mode: RefinementMode): void {
    if (
      this.ref ||
      this.vm.working() ||
      this.vm.initializing() ||
      this.vm.attempted()
    )
      return;
    const ref = this.dialog.open(PublishingRefinementComponent, {
      injector: this.injector,
      data: mode,
      width: '960px',
      maxWidth: 'calc(100vw - 2rem)',
      maxHeight: '90dvh',
      ariaLabel:
        mode === 'source'
          ? 'Import workshop draft JSON'
          : 'Refine the draft',
      autoFocus: 'dialog',
      delayFocusTrap: false,
    });
    this.ref = ref;
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.ref === ref) this.ref = undefined;
      });
  }
}

@Component({
  selector: 'ngx-publishing-refinement',
  host: { class: 'ngx-design-system' },
  imports: [
    MatButtonModule,
    MatDialogModule,
    NgxButton,
    PublishingImagesComponent,
    PublishingSourceComponent,
    PublishingProgressComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h2 mat-dialog-title>
      {{
        source
          ? 'Import or edit workshop draft JSON'
          : 'Refine the draft'
      }}
    </h2>
    <mat-dialog-content>
      <p>
        {{
          source
            ? 'Paste your draft JSON, then validate it to open the workshop preview.'
            : 'Choose a workshop image or edit the source. Validate changes before publication.'
        }}
      </p>
      @if (vm.error() || vm.validation() || vm.saveError()) {
        <p class="refinement__error" role="alert">
          {{ vm.error() || vm.validation() || vm.saveError() }}
        </p>
      }
      @if (vm.working()) {
        <ngx-publishing-progress
          [operation]="vm.operation()"
          [elapsed]="vm.elapsed()"
        />
      }
      @if (!source) {
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
      }
      <ngx-publishing-source
        [json]="vm.json"
        [expanded]="source"
        [locked]="vm.working() || vm.initializing() || vm.attempted()"
        (validate)="vm.validate()"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button
        mat-button
        ngxButton
        type="button"
        [disabled]="vm.working()"
        (click)="close()"
      >
        {{ source ? 'Close' : 'Done' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    :host {
      display: block;
      color: var(--ngx-color-text);
      background: var(--ngx-color-surface);
    }
    .refinement__error {
      color: var(--ngx-color-error);
      padding: 1rem;
      border-left: 3px solid var(--ngx-color-error);
      overflow-wrap: anywhere;
    }
  `,
})
export class PublishingRefinementComponent {
  readonly vm = inject(PublishingViewModel);
  readonly source =
    inject<RefinementMode>(MAT_DIALOG_DATA) === 'source';
  private readonly ref = inject(
    MatDialogRef<PublishingRefinementComponent>
  );

  constructor() {
    effect(() => {
      this.ref.disableClose = this.vm.working();
      if (this.source && this.vm.step() !== 0) this.ref.close();
    });
  }
  close(): void {
    if (!this.vm.working()) this.ref.close();
  }
}
