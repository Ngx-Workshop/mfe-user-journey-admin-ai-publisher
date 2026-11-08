import { SavedDraftsStore } from '../../../../../src/app/features/workshop-publishing/state/saved-drafts.store';
import {
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { PublishingComponent } from '../../../../../src/app/features/workshop-publishing/pages/publishing.component';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('Workshop creation workspace', () => {
  it('requires generation and explicit review before publishing, and keeps recovery available', async () => {
    const draft: WorkshopDraft = {
      sectionId: 'angular',
      name: 'Functions',
      summary: 'Learn functions',
      level: 1,
      pages: [
        { name: 'Introduction', blocks: [] },
        { name: 'Practice', blocks: [] },
      ],
      labs: [],
      assessment: {
        name: 'Quiz',
        subject: 'angular',
        level: 1,
        testQuestions: ['First question?', 'Second question?'].map(
          (question) => ({
            question,
            choices: [{ value: 'Yes' }],
            answer: 'Yes',
            correctResponse: 'Correct',
            incorrectResponse: 'Try again',
          })
        ),
      },
    };
    const publish = jasmine.createSpy().and.returnValue(EMPTY);
    TestBed.configureTestingModule({
      imports: [PublishingComponent],
      providers: [
        {
          provide: SavedDraftsStore,
          useValue: {
            get: (draftId: string) =>
              of({
                draftId,
                version: 1,
                name: 'Functions',
                json: '',
                status: 'ready',
                createdAt: '',
                updatedAt: '',
              }),
            save: (_row: unknown, json: string) =>
              of({
                draftId: '11111111-1111-4111-8111-111111111111',
                version: 2,
                json,
              }),
          },
        },
        provideZonelessChangeDetection(),
        {
          provide: MAT_DIALOG_DEFAULT_OPTIONS,
          useValue: {
            role: 'dialog',
            enterAnimationDuration: '0ms',
            exitAnimationDuration: '0ms',
          },
        },
        provideRouter([]),
        {
          provide: PublishingStore,
          useValue: {
            repairOptions: signal(null),
            busy: signal(false),
            error: signal(''),
            sections: signal([{ id: 'angular', name: 'Angular' }]),
            catalog: signal({
              models: [
                {
                  id: 'model',
                  inputUsdPerMillion: 1,
                  outputUsdPerMillion: 2,
                },
              ],
              defaultModel: 'model',
              imageModel: 'image',
            }),
            history: signal([]),
            images: signal([]),
            unconfirmedRequests: signal([]),
            loadSections: () => of(undefined),
            loadModels: () => of(undefined),
            loadHistory: () => of([]),
            draft: () => of(draft),
            prepare: () =>
              of({
                preparationId: '11111111-1111-4111-8111-111111111111',
                status: 'complete',
                ready: true,
                createdAt: '2026-11-05T12:00:00Z',
                updatedAt: '2026-11-05T12:00:00Z',
                activities: [],
                repairCount: 0,
                draft,
              }),
            publish,
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(PublishingComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const button = (text: string) =>
      Array.from(element.querySelectorAll('button')).find((b) =>
        b.textContent?.includes(text)
      )!;
    expect(element.querySelector('mat-stepper')).toBeNull();
    expect(
      element.querySelector('.publisher-actions__bar h1')
    ).toBeNull();
    expect(
      element.querySelector('.publisher-actions__bar')
        ?.firstElementChild?.tagName
    ).toBe('NGX-PUBLISHING-JOURNEY');
    expect(element.querySelector('main h1')).not.toBeNull();
    expect(
      element.querySelector(
        '.publisher-actions__bar > ngx-publishing-journey'
      )
    ).not.toBeNull();
    expect(button('New workshop')).toBeUndefined();
    expect(button('Request history').getAttribute('shape')).toBe(
      'chevron'
    );
    expect(button('Request history').textContent).toContain(
      'arrow_forward'
    );
    expect(
      element.querySelector('.setup__guidance')?.textContent
    ).toContain('A complete draft. Your final say.');
    expect(
      element.querySelector('.setup__model-panel select')
    ).not.toBeNull();
    expect(element.querySelector('ngx-publishing-source')).toBeNull();
    expect(
      button('Generate workshop draft').closest('mat-card-actions')
    ).not.toBeNull();
    const openImport = async () => {
      element
        .querySelector<HTMLButtonElement>(
          '[aria-label="Import workshop draft JSON"]'
        )!
        .click();
      fixture.detectChanges();
      await fixture.whenStable();
      return document.querySelector<HTMLElement>('[role="dialog"]')!;
    };
    let sourceDialog = await openImport();
    const source = sourceDialog.querySelector('textarea')!;
    source.value = '{invalid';
    source.dispatchEvent(new Event('input', { bubbles: true }));
    sourceDialog
      .querySelector<HTMLButtonElement>(
        'ngx-publishing-source button'
      )!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(
      sourceDialog.querySelector('[role="alert"]')
    ).not.toBeNull();
    [...sourceDialog.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Close'))!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    sourceDialog = await openImport();
    expect(sourceDialog.querySelector('textarea')!.value).toBe(
      '{invalid'
    );
    [...sourceDialog.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Close'))!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 100));

    button('Publication').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(0);
    fixture.componentInstance.vm.form.setValue({
      brief: 'Teach functions',
      sectionId: 'angular',
      level: 1,
    });
    fixture.detectChanges();
    button('Generate workshop draft').click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    button('Workshop brief').click();
    fixture.detectChanges();
    expect(
      element.querySelector(
        '.setup__guidance ngx-publishing-preparation'
      )
    ).not.toBeNull();
    expect(
      element.querySelector('.setup__guidance')?.textContent
    ).not.toContain('A complete draft. Your final say.');
    expect(element.textContent).not.toContain(
      'Return to draft review'
    );
    sourceDialog = await openImport();
    sourceDialog
      .querySelector<HTMLButtonElement>(
        'ngx-publishing-source button'
      )!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    expect(fixture.componentInstance.vm.step()).toBe(1);
    expect(document.querySelector('[role="dialog"]')).toBeNull();

    button('Publication').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    const checks = element.querySelector(
      '.publisher__checks ngx-panel'
    )!;
    expect(checks.getAttribute('data-shape')).toBe('chamfered');
    const preview = element.querySelector(
      'ngx-panel.publisher__preview'
    )!;
    expect(
      preview.querySelector('mat-card-header')?.textContent
    ).toContain('Functions');
    expect(
      preview.querySelector('mat-card-header')?.textContent
    ).toContain('WORKSHOP PREVIEW / LEVEL 1');
    expect(preview.querySelector('.review__info h2')).toBeNull();
    const tabs = element.querySelector(
      '.publisher__review-layout > ngx-publishing-review-tabs'
    )!;
    expect(tabs.closest('ngx-panel')).toBeNull();
    expect(element.textContent).not.toContain('Back to brief');
    expect(
      button('Continue to publish')
        .closest('mat-card-actions')
        ?.closest('ngx-panel')
    ).toBe(checks);
    expect(
      preview.querySelector('ngx-publishing-review-outline')
    ).toBeNull();
    const outlineButton = (name: string) =>
      [
        ...tabs.querySelectorAll<HTMLButtonElement>('.outline__item'),
      ].find((item) => item.textContent?.includes(name))!;
    outlineButton('Practice').click();
    fixture.detectChanges();
    expect(preview.textContent).toContain('Practice');
    expect(preview.textContent).toContain('DOCUMENTATION / PAGE 2');

    expect(preview.querySelector('[role="tablist"]')).toBeNull();
    const materialTabs = [
      ...tabs.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ];
    materialTabs[1].click();
    fixture.detectChanges();
    expect(preview.textContent).toContain(
      'No coding labs to preview'
    );
    materialTabs[1].dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
      })
    );
    fixture.detectChanges();
    expect(materialTabs[2].getAttribute('aria-selected')).toBe(
      'true'
    );
    expect(
      preview
        .querySelector('[role="tabpanel"]')
        ?.getAttribute('aria-labelledby')
    ).toBe(materialTabs[2].id);

    outlineButton('Second question?').click();
    fixture.detectChanges();
    expect(preview.textContent).toContain('Second question?');
    expect(preview.textContent).not.toContain('First question?');
    materialTabs[0].click();
    fixture.detectChanges();

    expect(
      element.querySelector(
        '.publisher__checks ngx-publishing-preparation'
      )
    ).not.toBeNull();
    expect(element.querySelector('.publisher__refine')).toBeNull();
    const refine = element.querySelector<HTMLButtonElement>(
      '[aria-label="Refine the draft"]'
    )!;
    refine.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const dialog =
      document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.contains(document.activeElement)).toBeTrue();
    expect(dialog.textContent).toContain('Workshop image');
    expect(
      dialog.querySelector('ngx-publishing-source')
    ).not.toBeNull();
    [...dialog.querySelectorAll('button')]
      .find((b) => b.textContent?.includes('Done'))!
      .click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(fixture.componentInstance.vm.draft()?.name).toBe(
      'Functions'
    );
    button('Continue to publish').click();
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.vm.step()).toBe(2);
    button('Publish reviewed workshop').click();
    fixture.detectChanges();
    expect(publish).toHaveBeenCalledTimes(1);
    expect(button('Publish reviewed workshop').disabled).toBeTrue();
    expect(button('Check publishing receipt').disabled).toBeFalse();
    expect(element.textContent).toContain('Keep this ID.');
  });
});
