import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ExampleMongodbDocComponent } from '../../components/document-card/example-mongodb-doc.component';
import { ExampleMongodbDocCreateFormModalComponent } from '../../components/editor/example-mongodb-doc-create-form-modal.component';
import type { ExampleMongodbDocDto, ExampleFormDialogData } from '../../models/example-document.models';
import { CatalogViewModel } from './catalog.view-model';

@Component({
  selector: 'ngx-example-mongodb-doc-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [CatalogViewModel],
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatProgressBarModule, ExampleMongodbDocComponent],
  template: `
    <section class="document-catalog" [attr.aria-busy]="vm.loading() || vm.mutating()">
      <h1>Example MongoDB Docs</h1>
      <div class="document-catalog__controls">
        <mat-form-field appearance="outline" class="document-catalog__search">
          <mat-label>Search</mat-label>
          <input #search matInput placeholder="Filter by name or description"
            [value]="vm.query()" (input)="vm.query.set(search.value)" />
          @if (vm.query()) {
            <button mat-icon-button matSuffix (click)="vm.query.set('')" aria-label="Clear search">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>
        <button mat-flat-button [disabled]="vm.mutating()" (click)="openCreate()"><mat-icon>add</mat-icon>New</button>
        <button mat-icon-button [disabled]="vm.mutating()" (click)="vm.reload()" aria-label="Refresh documents">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>
      @if (vm.loading()) { <mat-progress-bar mode="indeterminate" aria-label="Loading documents" /> }
      @if (vm.error()) {
        <div class="document-catalog__error" role="alert">
          <p>{{ vm.error() }}</p><button mat-button [disabled]="vm.loading()" (click)="vm.reload()">Retry loading</button>
        </div>
      }
      @if (vm.deleteError()) { <p class="document-catalog__error" role="alert">{{ vm.deleteError() }} Retry using Delete.</p> }
      <div class="document-catalog__grid">
        @for (document of vm.filtered(); track document._id) {
          <ngx-example-mongodb-doc [doc]="document" [disabled]="vm.loading() || vm.mutating()"
            (edit)="openEdit($event)" (remove)="confirmDelete($event)" />
        }
      </div>
      @if (!vm.loading() && !vm.error() && vm.filtered().length === 0) {
        <p class="document-catalog__empty" role="status">{{ vm.query() ? 'No matching documents' : 'No documents yet' }}</p>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }
    .document-catalog { max-width: 1200px; margin: auto; padding: 24px; color: var(--mat-sys-on-surface); }
    .document-catalog__controls { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
    .document-catalog__search { flex: 1; min-width: 200px; }
    .document-catalog__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr)); gap: 16px; }
    .document-catalog__empty { text-align: center; padding: 24px; }
    .document-catalog__error { color: var(--mat-sys-error); }
    @media (max-width: 600px) { .document-catalog { padding: 12px; } }
  `],
})
export class ExampleMongodbDocListComponent {
  readonly vm = inject(CatalogViewModel);
  private readonly dialog = inject(MatDialog);
  openCreate() { this.open({ mode: 'create' }); }
  openEdit(doc: ExampleMongodbDocDto) { this.open({ mode: 'edit', doc }); }
  confirmDelete(doc: ExampleMongodbDocDto) {
    if (!this.vm.loading() && !this.vm.mutating() && confirm(`Delete "${doc.name}"?`)) this.vm.remove(doc._id);
  }
  private open(data: ExampleFormDialogData) {
    if (this.vm.mutating()) return;
    this.dialog.open(ExampleMongodbDocCreateFormModalComponent, { data, width: '640px', maxWidth: '95vw' });
  }
}
