import { ClipboardModule } from '@angular/cdk/clipboard';
import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import type { ExampleMongodbDocDto } from '../../models/example-document.models';

@Component({
  selector: 'ngx-example-mongodb-doc',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClipboardModule, JsonPipe, MatButtonModule, MatCardModule, MatChipsModule, MatIconModule],
  template: `
    <mat-card class="document-card">
      <mat-card-header class="document-card__header">
        <mat-card-title class="document-card__title">{{ doc().name }}</mat-card-title>
        <mat-card-subtitle>
          <mat-chip-set aria-label="Document metadata">
            <mat-chip>{{ doc().type }}</mat-chip>
            <mat-chip>{{ doc().archived ? 'Archived' : 'Active' }}</mat-chip>
          </mat-chip-set>
        </mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="document-card__id">
          <span>ID: {{ doc()._id }}</span>
          <button mat-icon-button [cdkCopyToClipboard]="doc()._id" aria-label="Copy document ID">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
        @if (doc().description) { <p>{{ doc().description }}</p> }
        @if (doc().exampleMongodbDocObject; as address) {
          <pre class="document-card__address">{{ address | json }}</pre>
        }
      </mat-card-content>
      <mat-card-actions align="end">
        <button mat-button [disabled]="disabled()" (click)="edit.emit(doc())">Edit</button>
        <button mat-button [disabled]="disabled()" (click)="remove.emit(doc())">Delete</button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    :host { display: block; min-width: 0; }
    .document-card { height: 100%; }
    .document-card__header { display: block; }
    .document-card__title { overflow-wrap: anywhere; }
    .document-card__id { display: flex; align-items: center; gap: 4px; overflow-wrap: anywhere; }
    .document-card__address {
      white-space: pre-wrap; overflow-wrap: anywhere; padding: 12px;
      color: var(--mat-sys-on-primary-container); background: var(--mat-sys-primary-container);
    }
  `],
})
export class ExampleMongodbDocComponent {
  readonly doc = input.required<ExampleMongodbDocDto>();
  readonly disabled = input(false);
  readonly edit = output<ExampleMongodbDocDto>();
  readonly remove = output<ExampleMongodbDocDto>();
}
