import { inject, Injectable, signal } from '@angular/core';
import { catchError, defer, EMPTY, finalize, map, Observable, tap } from 'rxjs';
import { PublishingApiService } from '../api/publishing-api.service';
import {
  PublishingReceipt,
  WorkshopDraft,
  PublishingModelCatalog,
  WorkshopImage,
} from '../models/publishing.models';

@Injectable({ providedIn: 'root' })
export class PublishingStore {
  private readonly api = inject(PublishingApiService);
  private readonly catalogState = signal<PublishingModelCatalog | null>(null);
  private readonly historyState = signal<PublishingReceipt[]>([]);
  private readonly unconfirmedState = signal<string[]>([]);
  private readonly imagesState = signal<WorkshopImage[]>([]);
  private readonly sectionsState = signal<{ id: string; name: string }[]>([]);
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  private activeOperation: symbol | undefined;
  readonly catalog = this.catalogState.asReadonly();
  readonly history = this.historyState.asReadonly();
  readonly unconfirmedRequests = this.unconfirmedState.asReadonly();
  readonly images = this.imagesState.asReadonly();
  readonly sections = this.sectionsState.asReadonly();
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();

  loadModels(): Observable<PublishingModelCatalog> {
    return this.execute(() => this.api.models().pipe(
      tap((catalog) => this.catalogState.set(catalog))
    ));
  }
  loadHistory(): Observable<PublishingReceipt[]> {
    return this.execute(() => this.api.history().pipe(tap((history) => {
      this.historyState.set(history);
      this.unconfirmedState.update((ids) =>
        ids.filter((id) => !history.some((run) => run.requestId === id))
      );
    })));
  }
  loadImages(query: string): Observable<WorkshopImage[]> {
    return this.execute(() => this.api.images(query).pipe(
      tap((images) => this.imagesState.set(images))
    ));
  }
  generateImage(prompt: string, name: string): Observable<WorkshopImage> {
    return this.execute(() => this.api.call('workshop_image', {
      operation: 'generate', prompt, name,
    }).pipe(map((value) => this.api.image(value))));
  }
  loadSections(): Observable<{ id: string; name: string }[]> {
    return this.execute(() => this.api.sections().pipe(
      tap((sections) => this.sectionsState.set(sections))
    ));
  }
  draft(
    name: 'generate_workshop_draft' | 'validate_workshop_draft',
    input: unknown
  ): Observable<WorkshopDraft> {
    return this.execute(() => this.api.call(name, input).pipe(
      map((value) => this.api.draft(value))
    ));
  }
  publish(input: { requestId: string; draft: WorkshopDraft }): Observable<PublishingReceipt> {
    return this.execute(() => {
      // A cancelled browser request may still publish on the server.
      this.unconfirmedState.update((ids) => [
        input.requestId, ...ids.filter((id) => id !== input.requestId),
      ].slice(0, 100));
      return this.api.call('publish_workshop', input).pipe(
        map((value) => this.remember(this.api.receipt(value)))
      );
    });
  }
  receipt(requestId: string): Observable<PublishingReceipt> {
    return this.execute(() => this.api.call('get_publishing_run', { requestId }).pipe(
      map((value) => this.remember(this.api.receipt(value)))
    ));
  }
  private remember(receipt: PublishingReceipt): PublishingReceipt {
    this.unconfirmedState.update((ids) => ids.filter((id) => id !== receipt.requestId));
    this.historyState.update((rows) => [
      receipt, ...rows.filter((row) => row.requestId !== receipt.requestId),
    ].slice(0, 100));
    return receipt;
  }
  private execute<T>(operation: () => Observable<T>): Observable<T> {
    return defer(() => {
      if (this.busy()) return EMPTY;
      const token = Symbol();
      this.activeOperation = token;
      // Completion can start the next read before this operation's finalize runs.
      const release = () => {
        if (this.activeOperation !== token) return;
        this.activeOperation = undefined;
        this.busyState.set(false);
      };
      this.busyState.set(true);
      this.errorState.set('');
      return defer(operation).pipe(
        tap({ complete: release }),
        catchError((error: unknown) => {
          const status = error && typeof error === 'object' && 'status' in error
            ? error.status : undefined;
          this.errorState.set(
            status === 401 || status === 403
              ? 'Sign in as an administrator to publish workshops.'
              : status === 404
                ? 'Workshop publishing is not enabled on this gateway.'
                : error instanceof Error && !('status' in error)
                  ? error.message
                  : 'The publishing request failed. Keep the request ID and check its receipt before retrying.'
          );
          release();
          return EMPTY;
        }),
        finalize(release)
      );
    });
  }
}
