import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PublishingViewModel } from './publishing.view-model';
@Component({
  selector: 'ngx-workshop-publishing',
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
  ],
  providers: [PublishingViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="publisher" aria-labelledby="publisher-title">
      <p class="publisher__eyebrow">CREATE A WORKSHOP</p>
      <h2 id="publisher-title">Work with your Publishing Agent</h2>
      <p>
        Describe the subject, audience and learning objectives. Review
        the documentation, coding labs and assessment before
        publishing.
      </p>
      <p>Publishing uses your administrator sign-in.</p>
      <button
        mat-stroked-button
        [disabled]="vm.busy() || vm.attempted()"
        (click)="vm.loadSections()"
      >
        Browse workshop sections
      </button>
      <form [formGroup]="vm.form" (ngSubmit)="vm.generate()">
        <mat-form-field appearance="outline"
          ><mat-label>Workshop brief</mat-label
          ><textarea
            matInput
            formControlName="brief"
            rows="4"
            required
            [readonly]="vm.busy() || vm.attempted()"
          ></textarea>
        </mat-form-field>
        <div class="publisher__fields">
          @if (vm.sections().length) {
            <mat-form-field appearance="outline"
              ><mat-label>Workshop section</mat-label
              ><select
                matNativeControl
                formControlName="sectionId"
                required
              >
                <option value="">Choose a section</option>
                @for (section of vm.sections(); track section.id) {
                  <option [value]="section.id">
                    {{ section.name }}
                  </option>
                }
              </select></mat-form-field
            >
          } @else {
            <mat-form-field appearance="outline"
              ><mat-label>Existing section ID</mat-label
              ><input
                matInput
                formControlName="sectionId"
                required
                [readonly]="vm.busy() || vm.attempted()"
            /></mat-form-field>
          }
          <mat-form-field appearance="outline"
            ><mat-label>Level</mat-label
            ><input
              matInput
              type="number"
              formControlName="level"
              min="1"
              max="20"
              required
              [readonly]="vm.busy() || vm.attempted()"
          /></mat-form-field>
        </div>
        <button
          mat-flat-button
          type="submit"
          [disabled]="vm.busy() || vm.form.invalid || vm.attempted()"
        >
          Generate workshop draft
        </button>
      </form>
      @if (vm.busy()) {
        <mat-progress-bar
          mode="indeterminate"
          aria-label="Publishing Agent is working"
        />
      }
      @if (vm.error() || vm.validation()) {
        <p class="publisher__error" role="alert">
          {{ vm.error() || vm.validation() }}
        </p>
      }
      <details class="publisher__source">
        <summary>Import or edit workshop draft JSON</summary>
        <mat-form-field appearance="outline"
          ><mat-label>Workshop draft</mat-label
          ><textarea
            matInput
            [formControl]="vm.json"
            rows="16"
            (input)="vm.edited()"
            [readonly]="vm.busy() || vm.attempted()"
          ></textarea>
        </mat-form-field>
        <button
          mat-stroked-button
          [disabled]="vm.busy() || vm.attempted()"
          (click)="vm.validate()"
        >
          Validate changes
        </button>
      </details>
      @if (vm.draft(); as draft) {
        <article class="publisher__review">
          <h3>{{ draft.name }}</h3>
          <p>{{ draft.summary }}</p>
          <p>
            {{ draft.pages.length }} document pages ·
            {{ draft.labs.length }} coding labs ·
            {{ draft.assessment.testQuestions.length }} assessment
            questions
          </p>
          @for (page of draft.pages; track $index) {
            <details>
              <summary>Documentation: {{ page.name }}</summary>
              @for (block of page.blocks; track block.blockId) {
                @if (
                  block.componentInstanceName ===
                    'ParagraphBlockComponent' ||
                  block.componentInstanceName ===
                    'HeaderBlockComponent' ||
                  block.componentInstanceName ===
                    'NgxEditorJs2PanelComponent' ||
                  block.componentInstanceName ===
                    'NgxEditorJs2BlockquotesComponent'
                ) {
                  <div
                    class="publisher__block"
                    [innerHTML]="block.dataClean"
                  ></div>
                } @else {
                  <pre class="publisher__code">{{
                    block.dataClean
                  }}</pre>
                }
              }
            </details>
          }
          @for (lab of draft.labs; track $index) {
            <details>
              <summary>Coding lab: {{ lab.metadata.title }}</summary>
              <pre class="publisher__code">{{
                lab.version.promptMarkdown
              }}</pre>
              <h4>Starter code</h4>
              <pre class="publisher__code">{{
                lab.version.starterCode
              }}</pre>
              <h4>Reference solution and tests</h4>
              <pre class="publisher__code">{{
                vm.resource(lab.version)
              }}</pre>
            </details>
          }
          <details>
            <summary>Assessment: {{ draft.assessment.name }}</summary>
            @for (
              question of draft.assessment.testQuestions;
              track $index
            ) {
              <h4>{{ question.question }}</h4>
              @for (choice of question.choices; track $index) {
                <p>{{ choice.value }}</p>
              }
              <p><strong>Answer:</strong> {{ question.answer }}</p>
              <p>{{ question.correctResponse }}</p>
              <p>{{ question.incorrectResponse }}</p>
            }
          </details>
          <p>
            Publishing makes these resources available immediately.
            Coding labs must pass verification first.
          </p>
          <button
            mat-flat-button
            [disabled]="vm.busy() || vm.attempted()"
            (click)="vm.publish()"
          >
            Publish reviewed workshop
          </button>
        </article>
      }
      <p class="publisher__request">
        Publishing request ID: <code>{{ vm.requestId() }}</code>
      </p>
      @if (vm.attempted()) {
        <p>
          Keep this ID. Check its receipt if the connection fails
          before starting another workshop.
        </p>
      }
      <mat-form-field appearance="outline"
        ><mat-label>Receipt request ID (optional)</mat-label
        ><input
          matInput
          [formControl]="vm.receiptId"
          placeholder="Leave blank to check this workshop"
      /></mat-form-field>
      <button
        mat-stroked-button
        [disabled]="vm.busy()"
        (click)="vm.inspect()"
      >
        Check publishing receipt
      </button>
      @if (vm.receipt(); as receipt) {
        <div class="publisher__receipt" role="status">
          <h3>
            {{
              receipt.status === 'complete'
                ? 'Workshop published'
                : 'Publishing needs attention'
            }}
          </h3>
          <p>{{ receipt.message }}</p>
          @for (step of receipt.steps; track $index) {
            <details>
              <summary>{{ step.name }} — {{ step.status }}</summary>
              <pre class="publisher__code">{{
                vm.resource(step.result)
              }}</pre>
            </details>
          }
        </div>
      }
      <button
        mat-button
        [disabled]="vm.busy()"
        (click)="vm.newDraft()"
      >
        Start a new workshop
      </button>
    </section>
  `,
  styles: [
    `
      .publisher {
        padding: 1.5rem;
        margin: 1.5rem 0;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 1rem;
        background: var(--mat-sys-surface-container-lowest);
      }
      .publisher__eyebrow {
        color: var(--mat-sys-primary);
        font-size: 0.75rem;
        letter-spacing: 0.1em;
      }
      .publisher__fields {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1rem;
      }
      mat-form-field {
        width: 100%;
      }
      .publisher__review,
      .publisher__receipt,
      .publisher__source {
        margin-top: 1.5rem;
        padding: 1rem;
        border: 1px solid var(--mat-sys-outline-variant);
        border-radius: 0.5rem;
      }
      details {
        margin: 0.75rem 0;
      }
      summary {
        cursor: pointer;
        padding: 0.5rem;
        font-weight: 600;
      }
      .publisher__code {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        max-height: 32rem;
        overflow: auto;
        background: var(--mat-sys-surface-container);
        padding: 1rem;
      }
      .publisher__error {
        color: var(--mat-sys-error);
        padding: 1rem;
      }
      .publisher__request {
        overflow-wrap: anywhere;
      }
      .publisher__block {
        margin: 0.75rem;
      }
      button {
        margin: 0.5rem 0.5rem 0.5rem 0;
      }
      @media (max-width: 600px) {
        .publisher__fields {
          grid-template-columns: 1fr;
        }
        .publisher {
          padding: 1rem;
        }
      }
    `,
  ],
})
export class PublishingComponent {
  readonly vm = inject(PublishingViewModel);
}
