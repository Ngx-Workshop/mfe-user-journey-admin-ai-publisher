import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import {
  catchError,
  concatMap,
  debounceTime,
  EMPTY,
  filter,
  finalize,
  Observable,
  tap,
} from 'rxjs';
import { SavedWorkshopDraft } from '../../models/publishing.models';
import { SavedDraftsStore } from '../../state/saved-drafts.store';

@Injectable()
export class DraftPersistenceViewModel {
  private readonly store = inject(SavedDraftsStore);
  private readonly destroyRef = inject(DestroyRef);
  readonly json = new FormControl('', { nonNullable: true });
  readonly savedDraft = signal<SavedWorkshopDraft | null>(null);
  readonly savedDraftId = computed(
    () => this.savedDraft()?.draftId ?? null
  );
  readonly saving = signal(false);
  readonly saveError = signal('');
  readonly unsaved = signal(false);

  autosave(blocked: () => boolean, attempted: () => boolean): void {
    this.json.valueChanges
      .pipe(
        debounceTime(400),
        filter(() => !!this.savedDraft() && !attempted()),
        concatMap(() => (blocked() ? EMPTY : this.save())),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
  confirm(id: string): Observable<SavedWorkshopDraft> {
    return this.store.get(id).pipe(
      tap((row) => {
        this.savedDraft.set(row);
        this.unsaved.set(false);
        this.saveError.set('');
      })
    );
  }
  save(): Observable<unknown> {
    const row = this.savedDraft();
    if (!row || !this.unsaved()) return EMPTY;
    const json = this.json.value;
    this.saving.set(true);
    this.saveError.set('');
    return this.store.save(row, json).pipe(
      tap((saved) => {
        this.savedDraft.set(saved);
        this.unsaved.set(this.json.value !== json);
      }),
      catchError(() => {
        this.saveError.set(
          'Changes could not be saved. Another tab may have changed this draft. Copy your changes before reopening it.'
        );
        return EMPTY;
      }),
      finalize(() => this.saving.set(false))
    );
  }
  reset(): void {
    this.savedDraft.set(null);
    this.unsaved.set(false);
    this.saveError.set('');
    this.json.setValue('', { emitEvent: false });
  }
}
