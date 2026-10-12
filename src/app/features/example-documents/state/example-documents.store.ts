import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY, Observable, Subject, catchError, defer, finalize, switchMap, tap,
} from 'rxjs';
import { ExampleCrudApiService } from '../api/example-crud-api.service';
import type {
  CreateExampleMongodbDocDto, ExampleMongodbDocDto, UpdateExampleMongodbDocDto,
} from '../models/example-document.models';
import { apiError } from '../utils/api-error';

/** Shared server state and data orchestration, independent of any view. */
@Injectable({ providedIn: 'root' })
export class ExampleDocumentsStore {
  private readonly api = inject(ExampleCrudApiService);
  private readonly reloads = new Subject<void>();
  private readonly records = signal<ExampleMongodbDocDto[]>([]);
  private readonly loadingState = signal(false);
  private readonly errorState = signal('');
  private readonly pending = signal(0);
  readonly documents = this.records.asReadonly();
  readonly loading = this.loadingState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly mutating = computed(() => this.pending() > 0);

  constructor() {
    this.reloads.pipe(
      switchMap(() => defer(() => {
        this.loadingState.set(true);
        this.errorState.set('');
        return this.api.list$().pipe(
          tap(documents => this.records.set(documents)),
          catchError(error => {
            this.errorState.set(apiError(error));
            return EMPTY;
          }),
          finalize(() => this.loadingState.set(false)),
        );
      })),
      takeUntilDestroyed(inject(DestroyRef)),
    ).subscribe();
  }
  reload() { this.reloads.next(); }
  create(dto: CreateExampleMongodbDocDto) {
    return this.mutate(() => this.api.create$(dto));
  }
  update(id: string, patch: UpdateExampleMongodbDocDto) {
    return this.mutate(() => this.api.update$(id, patch));
  }
  remove(id: string) { return this.mutate(() => this.api.delete$(id)); }

  private mutate<T>(request: () => Observable<T>): Observable<T> {
    return defer(() => {
      this.pending.update(count => count + 1);
      return request().pipe(
        tap(() => this.reload()),
        finalize(() => this.pending.update(count => count - 1)),
      );
    });
  }
}
