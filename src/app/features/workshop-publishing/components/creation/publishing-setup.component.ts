import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { PublishingModelCatalog } from '../../models/publishing.models';
import { PublishingForm } from '../../forms/publishing-form';
import { PublishingModelComponent } from './publishing-model.component';
import { PublishingBriefComponent } from './publishing-brief.component';

@Component({
  selector: 'ngx-publishing-setup',
  imports: [
    NgxButton,
    NgxPanel,
    MatButtonModule,
    PublishingModelComponent,
    PublishingBriefComponent,
    MatIconModule,
    MatTooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="setup__layout">
      <ngx-panel
        class="setup__workspace"
        heading="Workshop creation"
        eyebrow="PUBLISHER / CREATE"
        shape="stepped"
        background="solid"
      >
        <button
          ngxPanelHeader
          mat-icon-button
          type="button"
          aria-label="Import workshop draft JSON"
          matTooltip="Import workshop draft JSON"
          [disabled]="locked() || initializing()"
          (click)="importSource.emit()"
        >
          <mat-icon>file_upload</mat-icon>
        </button>
        <button
          ngxPanelActions
          mat-flat-button
          ngxButton
          type="button"
          [disabled]="
            locked() ||
            initializing() ||
            form().invalid ||
            model().invalid
          "
          (click)="generate.emit()"
        >
          Generate workshop draft
        </button>
        <div class="setup__authoring">
          <ngx-panel
            class="setup__brief"
            heading="Shape your workshop"
            eyebrow="WORKSHOP / BRIEF"
            shape="stepped"
            background="glass"
            aria-label="Workshop brief"
          >
            <p class="setup__intro">
              Describe what learners should understand and build. The
              AI will draft documentation, coding labs and an
              assessment for you to review.
            </p>
            <ngx-publishing-brief
              [form]="form()"
              [sections]="sections()"
              [locked]="locked()"
              [initializing]="initializing()"
              (generate)="generate.emit()"
            />
          </ngx-panel>
          <ngx-panel
            class="setup__model-panel"
            heading="Choose your AI model"
            eyebrow="WORKSHOP / MODEL"
            shape="beveled"
            background="glass"
          >
            <ngx-publishing-model
              [model]="model()"
              [catalog]="catalog()"
              [errors]="errors()"
              [locked]="locked() || initializing()"
            />
            @if (errors().length) {
              <button
                mat-button
                ngxButton
                surface="outline"
                type="button"
                [disabled]="locked() || initializing()"
                (click)="retry.emit()"
              >
                Retry workshop setup
              </button>
            }
          </ngx-panel>
        </div>
      </ngx-panel>
      <ngx-panel
        class="setup__guidance"
        [heading]="
          hasChecks() ? '' : 'A complete draft. Your final say.'
        "
        eyebrow="FROM IDEA TO WORKSHOP"
        shape="chamfered"
        background="solid"
        aria-label="What happens next"
      >
        <ng-content select="[publisherChecks]" />
        @if (!hasChecks()) {
          <ol>
            <li>
              <strong>Set the direction</strong>
              <p>
                Add the topic, audience, prerequisites and a concrete
                learning outcome.
              </p>
            </li>
            <li>
              <strong>Explore the materials</strong>
              <p>
                Read each page, inspect lab instructions and code, and
                review assessment questions.
              </p>
            </li>
            <li>
              <strong>Publish with confidence</strong>
              <p>
                Approve the reviewed draft, then check the publication
                receipt.
              </p>
            </li>
          </ol>
          <p class="setup__note">
            Generation may take a few minutes. Your draft stays
            unpublished until you explicitly publish it.
          </p>
        }
      </ngx-panel>
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .setup__layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(340px, 420px);
      gap: var(--ngx-space-4);
      align-items: start;
    }
    .setup__authoring {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--ngx-space-4);
      align-items: start;
    }
    .setup__workspace,
    .setup__brief,
    .setup__model-panel,
    .setup__guidance {
      display: block;
      min-width: 0;
      height: auto;
    }
    .setup__guidance ol {
      padding-left: 1.25rem;
    }
    .setup__guidance li {
      padding: 0.75rem 0 0.25rem;
    }
    .setup__guidance p {
      color: var(--ngx-color-muted);
      line-height: 1.6;
      font-size: 0.85rem;
    }
    .setup__note {
      border-top: 1px solid var(--ngx-color-border);
      padding-top: 1rem;
    }
    .setup__intro {
      color: var(--ngx-color-muted);
      line-height: 1.7;
      margin: 0 0 1.5rem;
    }
    @media (max-width: 1200px) {
      .setup__authoring {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    @media (max-width: 900px) {
      .setup__layout {
        grid-template-columns: minmax(0, 1fr);
      }
    }
  `,
})
export class PublishingSetupComponent {
  readonly model = input.required<FormControl<string>>();
  readonly catalog = input<PublishingModelCatalog | null>(null);
  readonly errors = input<readonly string[]>([]);
  readonly form = input.required<PublishingForm>();
  readonly sections =
    input.required<readonly { id: string; name: string }[]>();
  readonly locked = input(false);
  readonly initializing = input(false);
  readonly hasChecks = input(false);
  readonly generate = output<void>();
  readonly importSource = output<void>();
  readonly retry = output<void>();
}
