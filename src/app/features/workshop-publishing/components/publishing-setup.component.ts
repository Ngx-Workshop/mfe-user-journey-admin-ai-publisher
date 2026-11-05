import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  NgxButton,
  NgxPanel,
} from '@tmdjr/ngx-workshop-design-system';
import { PublishingModelCatalog } from '../models/publishing.models';
import { PublishingForm } from '../forms/publishing-form';
import { PublishingModelComponent } from './publishing-model.component';
import { PublishingBriefComponent } from './publishing-brief.component';
import { PublishingSourceComponent } from './publishing-source.component';

@Component({
  selector: 'ngx-publishing-setup',
  imports: [
    NgxButton,
    NgxPanel,
    MatButtonModule,
    PublishingModelComponent,
    PublishingBriefComponent,
    PublishingSourceComponent,
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
            <ngx-publishing-brief
              [form]="form()"
              [sections]="sections()"
              [locked]="locked()"
              [initializing]="initializing()"
              [modelValid]="model().valid"
              (generate)="generate.emit()"
            />
            @if (hasDraft()) {
              <button
                class="setup__resume"
                mat-flat-button
                ngxButton
                type="button"
                [disabled]="locked()"
                (click)="resume.emit()"
              >
                Return to draft review
              </button>
            }
          </ngx-panel>
          <ngx-panel
            class="setup__source-panel"
            heading="Import or edit workshop draft JSON"
            eyebrow="WORKSHOP / SOURCE"
            shape="beveled"
            background="glass"
          >
            <p class="setup__intro">
              Already have a draft? Paste its JSON here, then validate
              it to open the workshop preview.
            </p>
            <ngx-publishing-source
              [json]="json()"
              [expanded]="true"
              [locked]="locked() || initializing()"
              (validate)="validate.emit()"
            />
          </ngx-panel>
        </div>
      </ngx-panel>
      <ngx-panel
        class="setup__guidance"
        heading="A complete draft. Your final say."
        eyebrow="FROM IDEA TO WORKSHOP"
        shape="chamfered"
        background="solid"
        aria-label="What happens next"
      >
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
      grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
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
    .setup__source-panel,
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
    .setup__resume {
      margin-top: 1.25rem;
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
  readonly json = input.required<FormControl<string>>();
  readonly locked = input(false);
  readonly initializing = input(false);
  readonly hasDraft = input(false);
  readonly generate = output<void>();
  readonly validate = output<void>();
  readonly retry = output<void>();
  readonly resume = output<void>();
}
