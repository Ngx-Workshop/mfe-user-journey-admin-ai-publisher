import { JsonPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgxCodeBlock } from '@tmdjr/ngx-workshop-design-system';
import { marked } from 'marked';
import { WorkshopDraft } from '../../models/publishing.models';

@Component({
  selector: 'ngx-publishing-lab-preview',
  imports: [NgxCodeBlock, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="lab" aria-label="Coding lab preview">
      <p class="lab__eyebrow">
        CODING LAB / {{ lab().version.language }} /
        {{ lab().metadata.difficulty }}
      </p>
      <h3>{{ lab().metadata.title }}</h3>
      <p>{{ lab().metadata.summary }}</p>
      <h4>Instructions</h4>
      <div
        class="lab__instructions"
        [innerHTML]="instructions()"
      ></div>
      <ngx-code-block
        label="Starter code"
        [language]="lab().version.language"
        [code]="lab().version.starterCode"
        [wrap]="true"
      />
      @if (lab().version.hints.length) {
        <details class="lab__disclosure">
          <summary>Hints ({{ lab().version.hints.length }})</summary>
          <ol>
            @for (hint of lab().version.hints; track $index) {
              <li>{{ hint }}</li>
            }
          </ol>
        </details>
      }
      <details class="lab__disclosure">
        <summary>Reference solution</summary>
        <ngx-code-block
          label="Reference solution"
          [language]="lab().version.language"
          [code]="lab().version.referenceSolution.code"
          [wrap]="true"
        />
      </details>
      <details class="lab__disclosure">
        <summary>
          Verification tests ({{
            lab().version.sampleTests.length +
              lab().version.hiddenTests.length
          }})
        </summary>
        <h4>Sample tests</h4>
        @for (test of lab().version.sampleTests; track $index) {
          <h5>{{ test.name }}</h5>
          <pre>{{ test | json }}</pre>
        } @empty {
          <p>No sample tests.</p>
        }
        <h4>Hidden tests · administrator view</h4>
        @for (test of lab().version.hiddenTests; track $index) {
          <h5>{{ test.name }}</h5>
          <pre>{{ test | json }}</pre>
        } @empty {
          <p>No hidden tests.</p>
        }
        <p>
          Entry function: {{ lab().version.runner.entryFnName }} ·
          Timeout: {{ lab().version.runner.timeoutMs }} ms
        </p>
      </details>
      <p class="lab__note">
        Read-only preview. Code is not executed here; coding labs are
        verified during publication.
      </p>
    </article>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .lab {
      line-height: 1.7;
      overflow-wrap: anywhere;
    }
    .lab__eyebrow {
      color: var(--ngx-color-primary);
      font: 0.7rem var(--ngx-font-mono);
      text-transform: uppercase;
    }
    h3 {
      margin-top: 0.75rem;
      font-size: 1.5rem;
    }
    h4 {
      margin-top: 1.5rem;
    }
    .lab__instructions {
      overflow: auto;
    }
    .lab__instructions {
      max-width: 78ch;
    }
    .lab__disclosure {
      border-top: 1px solid var(--ngx-color-border);
      padding: 1rem 0;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
    }
    ngx-code-block {
      display: block;
      min-width: 0;
      margin: 1rem 0;
      position: relative;
    }
    pre {
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      padding: 1rem;
      background: var(--ngx-color-surface-high);
    }
    .lab__note {
      color: var(--ngx-color-muted);
      font-size: 0.85rem;
    }
  `,
})
export class PublishingLabPreviewComponent {
  readonly lab = input.required<WorkshopDraft['labs'][number]>();
  readonly instructions = computed(() =>
    marked.parse(this.lab().version.promptMarkdown, { async: false })
  );
}
