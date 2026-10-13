import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { JsonPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import type { CatalogResult } from '../../models/console.models';

@Component({
  selector: 'ngx-mcp-result',
  imports: [JsonPipe, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (result(); as result) {
      <div class="result">
        @switch (result.name) {
          @case ('list_workshops') {
            <p class="result__count">
              {{ result.data.workshops.length }} workshops returned
            </p>
            @for (
              workshop of result.data.workshops;
              track workshop.id
            ) {
              <article class="result__card">
                <span class="result__eyebrow"
                  >LEVEL {{ workshop.level }}</span
                >
                <h3>{{ workshop.title }}</h3>
                <p>{{ workshop.summary }}</p>
                <code>{{ workshop.id }}</code>
                <button
                  mat-button
                  (click)="
                    workshopSelected.emit({
                      sectionId: workshop.sectionId,
                      workshopId: workshop.id,
                    })
                  "
                >
                  Inspect workshop →
                </button>
              </article>
            } @empty {
              <p class="result__empty">
                No workshops in this section. Try another section ID.
              </p>
            }
          }
          @case ('get_workshop') {
            <span class="result__eyebrow"
              >WORKSHOP · LEVEL {{ result.data.workshop.level }}</span
            >
            <h3>{{ result.data.workshop.title }}</h3>
            <p>{{ result.data.workshop.summary }}</p>
            <h4>Learning outline</h4>
            <ol class="result__outline">
              @for (
                item of result.data.workshop.outline;
                track $index
              ) {
                <li>
                  <strong>{{ item.title }}</strong
                  ><span>{{ item.kind }}</span
                  ><code>{{ item.resourceId }}</code>
                  @if (item.kind === 'CODING_LAB') {
                    <button
                      mat-button
                      (click)="labSelected.emit(item.resourceId)"
                    >
                      Inspect lab →
                    </button>
                  }
                </li>
              } @empty {
                <li>No outline items available.</li>
              }
            </ol>
          }
          @case ('get_coding_lab') {
            <span class="result__eyebrow"
              >{{ result.data.lab.language }} · VERSION
              {{ result.data.lab.versionNumber }} ·
              {{
                result.data.lab.difficulty || 'Unspecified difficulty'
              }}</span
            >
            <h3>{{ result.data.lab.title }}</h3>
            <h4>Prompt</h4>
            <pre class="result__prose">{{
              result.data.lab.promptMarkdown
            }}</pre>
            <h4>Starter code</h4>
            <pre>{{ result.data.lab.starterCode }}</pre>
            <h4>Hints</h4>
            <ol>
              @for (hint of result.data.lab.hints; track $index) {
                <li>{{ hint }}</li>
              } @empty {
                <li>No published hints.</li>
              }
            </ol>
            <h4>Public sample tests</h4>
            @for (test of result.data.lab.sampleTests; track $index) {
              <details>
                <summary>{{ test.name }} · {{ test.kind }}</summary>
                <pre>{{ test | json }}</pre>
              </details>
            } @empty {
              <p>No public sample tests.</p>
            }
          }
        }
        <details class="result__raw">
          <summary>View response JSON</summary>
          <pre>{{ result.raw }}</pre>
        </details>
      </div>
    }
  `,
  styles: [
    `
      :host {
        display: block;
        min-width: 0;
      }
      .result {
        color: var(--mat-sys-on-surface, #202a34);
      }
      .result__count,
      .result__eyebrow {
        color: var(--mat-sys-on-surface-variant, #566573);
        font-size: 0.78rem;
        letter-spacing: 0.05em;
      }
      .result__card {
        padding: 1rem 0;
        border-bottom: 1px solid
          var(--mat-sys-outline-variant, #d8e0e5);
      }
      h3 {
        margin: 0.5rem 0;
        font-size: 1.2rem;
      }
      h4 {
        margin: 1.5rem 0 0.65rem;
      }
      p,
      li {
        line-height: 1.65;
      }
      code {
        overflow-wrap: anywhere;
        font-size: 0.8rem;
      }
      .result__card button {
        display: block;
        margin-top: 0.75rem;
      }
      .result__outline {
        padding-left: 1.4rem;
      }
      .result__outline li {
        padding: 0.7rem 0.3rem;
      }
      .result__outline span,
      .result__outline code {
        display: block;
      }
      .result__outline span {
        font-size: 0.7rem;
        color: var(--mat-sys-primary, #006879);
      }
      pre {
        padding: 1rem;
        background: var(--mat-sys-surface-container, #eef3f6);
        border-radius: 0.6rem;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        font-size: 0.8rem;
        line-height: 1.6;
      }
      .result__prose {
        font-family: inherit;
      }
      details {
        margin-top: 0.7rem;
      }
      summary {
        cursor: pointer;
        padding: 0.7rem 0;
        font-weight: 600;
      }
      .result__raw {
        margin-top: 1.5rem;
        border-top: 1px solid var(--mat-sys-outline-variant, #d8e0e5);
      }
      .result__empty {
        padding: 2rem 0;
      }
    `,
  ],
})
export class ResultComponent {
  readonly result = input.required<CatalogResult>();
  readonly workshopSelected = output<{
    sectionId: string;
    workshopId: string;
  }>();
  readonly labSelected = output<string>();
}
