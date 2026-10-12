import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, defer, exhaustMap, finalize, tap } from 'rxjs';
import { ExampleFormService } from '../../forms/example-form.service';
import type {
  ExampleFormDialogData, ExampleMongodbDocDto,
} from '../../models/example-document.models';
import { ExampleDocumentsStore } from '../../state/example-documents.store';
import { apiError } from '../../utils/api-error';

@Injectable()
export class EditorViewModel {
  private readonly forms = inject(ExampleFormService);
  private readonly store = inject(ExampleDocumentsStore);
  private readonly submissions = new Subject<void>();
  private readonly savedEvents = new Subject<ExampleMongodbDocDto>();
  private data: ExampleFormDialogData = { mode: 'create' };
  readonly saved$ = this.savedEvents.asObservable();
  readonly submitting = signal(false);
  readonly error = signal('');
  form = this.forms.createCreateForm();

  constructor() {
    this.submissions.pipe(exhaustMap(() => defer(() => {
      this.form.markAllAsTouched();
      if (this.form.invalid || this.submitting()) return EMPTY;
      if (this.data.mode === 'edit' && !this.data.doc) {
        this.error.set('This document is unavailable. Close and reopen the editor.');
        return EMPTY;
      }
      const request = this.data.doc && this.data.mode === 'edit'
        ? this.store.update(this.data.doc._id, this.forms.toPatchDto(this.form))
        : this.store.create(this.forms.toCreateDto(this.form));
      this.error.set('');
      this.submitting.set(true);
      this.form.disable({ emitEvent: false });
      return request.pipe(
        tap(document => this.savedEvents.next(document)),
        catchError(error => { this.error.set(apiError(error)); return EMPTY; }),
        finalize(() => {
          this.submitting.set(false);
          this.form.enable({ emitEvent: false });
        }),
      );
    })), takeUntilDestroyed(inject(DestroyRef))).subscribe();
  }
  initialize(data: ExampleFormDialogData) {
    this.data = data;
    this.form = this.forms.createCreateForm(data.doc);
  }
  save() { this.submissions.next(); }
}
