import { inject, Injectable, signal } from '@angular/core';
import {
  catchError,
  defer,
  EMPTY,
  finalize,
  Observable,
  tap,
} from 'rxjs';
import { PublishingApiService } from '../api/publishing-api.service';
import {
  SavedWorkshopDraft,
  WorkshopDraftSummary,
} from '../models/publishing.models';

@Injectable({ providedIn: 'root' })
export class SavedDraftsStore {
  private readonly api = inject(PublishingApiService);
  readonly rows = signal<WorkshopDraftSummary[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly hasMore = signal(false);
  load(more = false): Observable<WorkshopDraftSummary[]> {
    return defer(() => {
      this.busy.set(true);
      this.error.set('');
      const rows = this.rows();
      return this.api
        .savedDrafts(more ? rows.at(-1)?.draftId : undefined)
        .pipe(
          tap((next) => {
            this.rows.set(
              more
                ? [
                    ...rows,
                    ...next.filter(
                      (row) =>
                        !rows.some(
                          (existing) =>
                            existing.draftId === row.draftId
                        )
                    ),
                  ]
                : next
            );
            this.hasMore.set(next.length === 50);
          }),
          catchError(() => {
            this.error.set('Could not load your drafts. Try again.');
            return EMPTY;
          }),
          finalize(() => this.busy.set(false))
        );
    });
  }
  get(id: string): Observable<SavedWorkshopDraft> {
    return this.api.savedDraft(id);
  }
  save(
    row: SavedWorkshopDraft,
    json: string
  ): Observable<SavedWorkshopDraft> {
    return this.api.saveDraft(row, json);
  }
}
