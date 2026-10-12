import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import type { ExampleFormDialogData } from '../../models/example-document.models';
import { DocumentFormComponent } from '../document-form/document-form.component';
import { EditorViewModel } from './editor.view-model';

@Component({
  selector: 'ngx-example-mongodb-doc-create-form-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EditorViewModel],
  imports: [ReactiveFormsModule, MatButtonModule, MatDialogModule, DocumentFormComponent],
  template: `
    <form class="document-editor" [formGroup]="vm.form" (ngSubmit)="vm.save()" [attr.aria-busy]="vm.submitting()">
      <h2 mat-dialog-title>{{ data.mode === 'create' ? 'Create Example Doc' : 'Edit Example Doc' }}</h2>
      <mat-dialog-content>
        <ngx-document-form [form]="vm.form" [editing]="data.mode === 'edit'" />
        @if (vm.error()) { <p class="document-editor__error" role="alert">{{ vm.error() }}</p> }
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button type="button" [disabled]="vm.submitting()" (click)="close()">Cancel</button>
        <button mat-flat-button type="submit" [disabled]="vm.form.invalid || vm.submitting()">
          {{ vm.submitting() ? 'Saving…' : data.mode === 'create' ? 'Create' : 'Save' }}
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [` .document-editor__error { color: var(--mat-sys-error); } `],
})
export class ExampleMongodbDocCreateFormModalComponent {
  readonly vm = inject(EditorViewModel);
  readonly data = inject<ExampleFormDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<ExampleMongodbDocCreateFormModalComponent>);
  constructor() {
    this.vm.initialize(this.data);
    this.vm.saved$.pipe(takeUntilDestroyed(inject(DestroyRef))).subscribe(document => this.dialogRef.close(document));
    effect(() => { this.dialogRef.disableClose = this.vm.submitting(); });
  }
  close() { if (!this.vm.submitting()) this.dialogRef.close(); }
}
