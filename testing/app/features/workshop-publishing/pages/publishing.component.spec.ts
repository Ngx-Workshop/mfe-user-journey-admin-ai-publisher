import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, EMPTY } from 'rxjs';
import { PublishingComponent } from '../../../../../src/app/features/workshop-publishing/pages/publishing.component';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('AI creation wizard', () => {
  it('requires generation and explicit review before publishing, and keeps recovery available', async () => {
    const draft: WorkshopDraft = { sectionId: 'angular', name: 'Functions', summary: 'Learn functions', level: 1,
      pages: [], labs: [], assessment: { name: 'Quiz', subject: 'angular', level: 1, testQuestions: [] } };
    const publish = jasmine.createSpy().and.returnValue(EMPTY);
    TestBed.configureTestingModule({ imports: [PublishingComponent], providers: [provideZonelessChangeDetection(), provideRouter([]),
      { provide: PublishingStore, useValue: {
        busy: signal(false), error: signal(''), sections: signal([{ id: 'angular', name: 'Angular' }]),
        catalog: signal({ models: [{ id: 'model', inputUsdPerMillion: 1, outputUsdPerMillion: 2 }], defaultModel: 'model', imageModel: 'image' }),
        history: signal([]), images: signal([]), unconfirmedRequests: signal([]),
        loadSections: () => of(undefined), loadModels: () => of(undefined), loadHistory: () => of([]),
        draft: () => of(draft), publish,
      } },
    ] });
    const fixture = TestBed.createComponent(PublishingComponent);
    fixture.detectChanges(); await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    const button = (text: string) => Array.from(element.querySelectorAll('button')).find(b => b.textContent?.includes(text))!;
    const headers = element.querySelectorAll<HTMLElement>('mat-step-header');
    headers[2].click(); fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(0);
    fixture.componentInstance.vm.form.setValue({ brief: 'Teach functions', sectionId: 'angular', level: 1 });
    fixture.detectChanges(); button('Generate workshop draft').click();
    fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    headers[2].click(); fixture.detectChanges();
    expect(fixture.componentInstance.vm.step()).toBe(1);
    button('Continue to publish').click(); fixture.detectChanges(); await fixture.whenStable();
    expect(fixture.componentInstance.vm.step()).toBe(2);
    button('Publish reviewed workshop').click(); fixture.detectChanges();
    expect(publish).toHaveBeenCalledTimes(1);
    expect(button('Publish reviewed workshop').disabled).toBeTrue();
    expect(button('Check publishing receipt').disabled).toBeFalse();
    expect(element.textContent).toContain('Keep this ID.');
  });
});
