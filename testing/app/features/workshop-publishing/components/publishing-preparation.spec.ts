import { TestBed } from '@angular/core/testing';
import { PublishingPreparationComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-preparation.component';
import { PreparationReport } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

const report: PreparationReport = {
  preparationId: '11111111-1111-4111-8111-111111111111',
  status: 'complete',
  ready: false,
  createdAt: '2026-11-05T12:00:00Z',
  updatedAt: '2026-11-05T12:00:02Z',
  repairCount: 0,
  activities: [
    {
      id: 'skill',
      label: 'Coding lab skill',
      kind: 'skill',
      status: 'passed',
      detail: 'Supplied instructions',
      skillVersion: '1.0.0',
      skillHash: 'a'.repeat(64),
    },
    {
      id: 'reference',
      label: 'Reference solution',
      kind: 'check',
      status: 'failed',
      detail: '1/2 tests passed\nEmpty array: failed',
      startedAt: '2026-11-05T12:00:00Z',
      finishedAt: '2026-11-05T12:00:02Z',
    },
    {
      id: 'human',
      label: 'Administrator review',
      kind: 'review',
      status: 'review_required',
      detail: 'Check factual accuracy and rendering.',
    },
  ],
};
describe('Preparation activity presentation', () => {
  it('distinguishes supplied skills, failed execution and required human review with inspectable evidence', () => {
    const fixture = TestBed.createComponent(
      PublishingPreparationComponent
    );
    fixture.componentRef.setInput('report', report);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Checks need attention');
    expect(element.textContent).toContain('Supplied to model');
    expect(element.textContent).toContain('Skill version 1.0.0');
    expect(element.textContent).toContain('Empty array: failed');
    expect(element.textContent).toContain('Completed in 2.0s');
    expect(element.textContent).toContain('Your review required');
    expect(
      element
        .querySelector('[data-status=failed] details')
        ?.hasAttribute('open')
    ).toBeTrue();
    expect(
      element.querySelector('section')?.getAttribute('aria-busy')
    ).toBe('false');
  });
  it('summarizes the final attempt while preserving earlier failed findings', () => {
    const fixture = TestBed.createComponent(
      PublishingPreparationComponent
    );
    fixture.componentRef.setInput('report', {
      ...report,
      ready: true,
      repairCount: 1,
      activities: [
        ...report.activities,
        {
          id: 'recheck-reference',
          label: 'Reference solution again',
          kind: 'check',
          status: 'passed',
          detail: '2/2 passed',
        },
      ],
    });
    fixture.detectChanges();
    expect(fixture.componentInstance.failed()).toBe(0);
    expect(fixture.componentInstance.passed()).toBe(1);
    expect(fixture.nativeElement.textContent).toContain(
      'Empty array: failed'
    );
    expect(fixture.nativeElement.textContent).toContain(
      'Automated checks passed'
    );
  });
  it('offers progress resumption only when polling is no longer active', () => {
    const fixture = TestBed.createComponent(
      PublishingPreparationComponent
    );
    fixture.componentRef.setInput('report', {
      ...report,
      status: 'running',
    });
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
    fixture.componentRef.setInput('locked', false);
    fixture.detectChanges();
    const resume = jasmine.createSpy();
    fixture.componentInstance.resume.subscribe(resume);
    (
      fixture.nativeElement.querySelector(
        'button'
      ) as HTMLButtonElement
    ).click();
    expect(resume).toHaveBeenCalledTimes(1);
  });
});
