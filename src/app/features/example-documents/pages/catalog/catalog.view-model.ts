import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EMPTY, Subject, catchError, exhaustMap } from 'rxjs';
import { ExampleDocumentsStore } from '../../state/example-documents.store';
import { apiError } from '../../utils/api-error';

@Injectable()
export class CatalogViewModel {
  private readonly store = inject(ExampleDocumentsStore);
  private readonly removals = new Subject<string>();
  readonly query = signal('');
  readonly deleteError = signal('');
  readonly documents = this.store.documents;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly mutating = this.store.mutating;
  readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.documents().filter(document =>
      [document.name, document.description, document._id].some(value => value.toLowerCase().includes(query)));
  });
  constructor() {
    this.removals.pipe(exhaustMap(id => {
      this.deleteError.set('');
      return this.store.remove(id).pipe(catchError(error => {
        this.deleteError.set(apiError(error));
        return EMPTY;
      }));
    }), takeUntilDestroyed(inject(DestroyRef))).subscribe();
    this.reload();
  }
  reload() { this.store.reload(); }
  remove(id: string) { if (!this.mutating()) this.removals.next(id); }
}
