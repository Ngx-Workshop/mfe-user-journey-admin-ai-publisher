import { TestBed } from '@angular/core/testing';
import { PublishingPreparationComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-preparation.component';
import { PublishingRepairReviewComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-repair-review.component';
import { repairChanges } from '../../../../../src/app/features/workshop-publishing/utils/repair-changes';
import type {
  PreparationReport,
  WorkshopDraft,
} from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('AI check repair controls', () => {
  it('offers only server-eligible current findings, explains cost and locks duplicate actions', () => {
    const fixture = TestBed.createComponent(
      PublishingPreparationComponent
    );
    const report: PreparationReport = {
      preparationId: '11111111-1111-4111-8111-111111111111',
      status: 'complete',
      ready: false,
      draftHash: 'a'.repeat(64),
      repairCount: 1,
      createdAt: '',
      updatedAt: '',
      activities: [
        'coverage',
        'recheck-coverage',
        'recheck-lab-0-reference',
      ].map((id) => ({
        id,
        label: id,
        kind: 'check',
        status: 'failed',
        detail: 'Finding',
      })),
    };
    fixture.componentRef.setInput('report', report);
    fixture.componentRef.setInput('repairOptions', {
      preparationId: report.preparationId,
      draftHash: report.draftHash,
      model: 'selected-model',
      activities: [
        { activityId: 'recheck-coverage', label: 'Coverage' },
      ],
    });
    fixture.componentRef.setInput('repairModel', 'selected-model');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const buttons = Array.from(
      element.querySelectorAll('button')
    ).filter((button) => button.textContent?.includes('Fix with AI'));
    expect(buttons.length).toBe(1);
    expect(element.textContent).toContain('Model charges may apply');
    expect(element.textContent).toContain('selected-model');
    const repair = jasmine.createSpy();
    fixture.componentInstance.repair.subscribe(repair);
    buttons[0].click();
    expect(repair).toHaveBeenCalledWith('recheck-coverage');
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    expect(buttons[0].disabled).toBeTrue();
    fixture.componentRef.setInput('report', {
      ...report,
      ready: true,
    });
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Fix with AI');
  });
  it('does not claim earlier failures are in a fresh explicit repair report', () => {
    const fixture = TestBed.createComponent(
      PublishingPreparationComponent
    );
    fixture.componentRef.setInput('report', {
      preparationId: '11111111-1111-4111-8111-111111111111',
      status: 'complete',
      ready: true,
      repairCount: 1,
      createdAt: '',
      updatedAt: '',
      activities: [
        {
          id: 'coverage',
          label: 'Coverage',
          kind: 'check',
          status: 'passed',
          detail: 'Passed',
        },
      ],
    });
    fixture.detectChanges();
    expect(
      (fixture.nativeElement as HTMLElement).textContent
    ).not.toContain('Earlier failures remain');
  });
  it('reviews changed resources and exposes a locked restore action', () => {
    const fixture = TestBed.createComponent(
      PublishingRepairReviewComponent
    );
    fixture.componentRef.setInput('changes', [
      'Updated coding lab: Search',
    ]);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain(
      'Updated coding lab: Search'
    );
    const restore = jasmine.createSpy();
    fixture.componentInstance.restore.subscribe(restore);
    element.querySelector('button')!.click();
    expect(restore).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    expect(element.querySelector('button')!.disabled).toBeTrue();
  });
  it('ignores regenerated block IDs but reports changed learning content', () => {
    const before = {
      name: 'Search',
      summary: 'Summary',
      sectionId: 'angular',
      level: 2,
      pages: [
        {
          name: 'Intro',
          blocks: [
            {
              blockId: 'old',
              sortIndex: 0,
              componentInstanceName: 'ParagraphBlockComponent',
              savedAction: 'medium',
              dataClean: 'Text',
            },
          ],
        },
      ],
      labs: [],
      assessment: {
        name: 'Quiz',
        subject: 'angular',
        level: 2,
        testQuestions: [],
      },
    } satisfies WorkshopDraft;
    const after = structuredClone(before);
    after.pages[0].blocks[0].blockId = 'new';
    expect(repairChanges(before, after)).toEqual([]);
    after.pages[0].blocks[0].dataClean = 'Better explanation';
    expect(repairChanges(before, after)).toEqual([
      'Updated page: Intro',
    ]);
  });
});
