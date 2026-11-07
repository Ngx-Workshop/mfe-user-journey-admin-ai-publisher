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
      pages: [],
      labs: [],
      assessment: {
        name: 'Quiz',
        subject: 'angular',
        level: 1,
        testQuestions: [],
      },
    };
    const publish = jasmine.createSpy().and.returnValue(EMPTY);
    TestBed.configureTestingModule({
      imports: [PublishingComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: { role: 'dialog', enterAnimationDuration: '0ms', exitAnimationDuration: '0ms' } },
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
            prepare: () => of({ preparationId: '11111111-1111-4111-8111-111111111111', status: 'complete', ready: true,
              createdAt: '2026-11-05T12:00:00Z', updatedAt: '2026-11-05T12:00:00Z', activities: [], repairCount: 0, draft }),
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
    button('Publication').click();
    fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    expect(element.querySelector('.publisher__checks ngx-publishing-preparation')).not.toBeNull();
    expect(element.querySelector('.publisher__refine')).toBeNull();
    const refine = element.querySelector<HTMLButtonElement>('[aria-label="Refine the draft"]')!;
    refine.click();
    fixture.detectChanges();
    await fixture.whenStable();
    const dialog = document.querySelector<HTMLElement>('[role="dialog"]')!;
    expect(dialog).not.toBeNull();
    expect(dialog.contains(document.activeElement)).toBeTrue();
    expect(dialog.textContent).toContain('Workshop image');
    expect(dialog.querySelector('ngx-publishing-source')).not.toBeNull();
    [...dialog.querySelectorAll('button')].find(b => b.textContent?.includes('Done'))!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    await new Promise<void>(resolve => setTimeout(resolve, 100));
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(fixture.componentInstance.vm.draft()?.name).toBe('Functions');
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
