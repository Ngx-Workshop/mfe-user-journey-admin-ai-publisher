import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PublishingHistoryComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-history.component';
import type { HistoryRow } from '../../../../../src/app/features/workshop-publishing/models/history.models';

const rows: HistoryRow[] = [
  { requestId: 'complete-id', status: 'complete', summary: '10 of 10 steps complete', message: '', steps: [] },
  { requestId: 'running-id', status: 'running', summary: '2 of 10 steps complete', message: '', steps: [] },
  { requestId: 'recovery-id', status: 'needs_recovery', summary: '8 of 9 steps complete', message: 'Inspect completed resources', steps: [] },
  { requestId: 'unconfirmed-id', status: 'unconfirmed', summary: 'Result not confirmed', message: 'Check the receipt', steps: [] },
];

describe('Publisher receipt workspace', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] }));
  function create() {
    const fixture = TestBed.createComponent(PublishingHistoryComponent);
    fixture.componentRef.setInput('rows', rows);
    fixture.componentRef.setInput('allRows', rows);
    fixture.componentRef.setInput('total', rows.length);
    fixture.detectChanges();
    return fixture;
  }
  it('separates recovery and unconfirmed receipts without duplicating requests and retains inspect intent', () => {
    const fixture = create();
    const element: HTMLElement = fixture.nativeElement;
    const main = element.querySelector('.request-workspace__main')!;
    const issues = element.querySelector('.request-workspace__issues')!;
    expect(main.querySelectorAll('.history__row').length).toBe(2);
    expect(issues.querySelectorAll('.history__row').length).toBe(2);
    expect(main.textContent).toContain('complete-id');
    expect(main.textContent).not.toContain('recovery-id');
    expect(issues.textContent).toContain('recovery-id');
    expect(issues.textContent).toContain('unconfirmed-id');
    const inspect = jasmine.createSpy();
    fixture.componentInstance.inspect.subscribe(inspect);
    issues.querySelector<HTMLButtonElement>('[aria-label="Inspect receipt recovery-id"]')!.click();
    expect(inspect).toHaveBeenCalledOnceWith('recovery-id');
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();
    issues.querySelector<HTMLButtonElement>('[aria-label="Inspect receipt recovery-id"]')!.click();
    expect(inspect).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('busy', false);
    fixture.componentRef.setInput('error', 'History could not be refreshed');
    fixture.detectChanges();
    const retry = jasmine.createSpy();
    fixture.componentInstance.refresh.subscribe(retry);
    Array.from(issues.querySelectorAll('button')).find(button => button.textContent?.includes('Retry'))!.click();
    expect(retry).toHaveBeenCalledTimes(1);
  });
  it('applies filtered rows to both panels while retaining the issues panel and full summary', () => {
    const fixture = create();
    fixture.componentRef.setInput('rows', [rows[0]]);
    fixture.componentRef.setInput('status', 'complete');
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.history__row').length).toBe(1);
    expect(element.querySelector('.request-workspace__issues')?.textContent).toContain('No matching issues');
    expect(fixture.componentInstance.allRows().length).toBe(4);
    fixture.componentRef.setInput('rows', [rows[2]]);
    fixture.componentRef.setInput('status', 'needs_recovery');
    fixture.detectChanges();
    expect(fixture.componentInstance.activePane()).toBe('issues');
    expect(element.querySelector('.request-workspace__main')?.textContent).toContain('No completed or running requests');
    expect(element.querySelector('.request-workspace__issues .request-row__summary')?.getAttribute('title'))
      .toBe('8 of 9 steps complete · Inspect completed resources');
  });
});
