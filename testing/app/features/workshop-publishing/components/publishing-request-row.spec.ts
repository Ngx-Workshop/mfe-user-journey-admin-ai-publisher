import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { PublishingRequestRowComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-request-row.component';
import type { HistoryRow } from '../../../../../src/app/features/workshop-publishing/models/history.models';

describe('Publishing request row actions', () => {
  const row: HistoryRow = { requestId: 'request-id', status: 'needs_recovery', message: '', steps: [], summary: '8 of 9 steps complete',
    workshopName: 'Pure TypeScript Functions', workshopUrl: '/document-editor/angular/pure-type-script-functions' };
  const copy = jasmine.createSpy().and.returnValue(true);
  beforeEach(() => {
    copy.calls.reset();
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), { provide: Clipboard, useValue: { copy } }] });
  });
  function create(value = row) {
    const fixture = TestBed.createComponent(PublishingRequestRowComponent);
    fixture.componentRef.setInput('row', value);
    fixture.detectChanges();
    return fixture;
  }
  it('opens receipt details from its primary button and keeps copy as a separate action', () => {
    const fixture = create();
    const inspect = jasmine.createSpy();
    fixture.componentInstance.inspect.subscribe(inspect);
    const element: HTMLElement = fixture.nativeElement;
    element.querySelector<HTMLButtonElement>('[aria-label="Copy request ID request-id"]')!.click();
    fixture.detectChanges();
    expect(copy).toHaveBeenCalledOnceWith('request-id');
    expect(inspect).not.toHaveBeenCalled();
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Request ID copied');
    element.querySelector<HTMLButtonElement>('[aria-label="Inspect receipt request-id"]')!.click();
    expect(inspect).toHaveBeenCalledOnceWith('request-id');
    expect(element.querySelector('button button, button a')).toBeNull();
    expect(element.querySelector('.request-row__name')?.textContent).toContain(row.workshopName!);
  });
  it('launches the workshop via a new-tab link without emitting receipt inspection', () => {
    const fixture = create();
    const inspect = jasmine.createSpy();
    fixture.componentInstance.inspect.subscribe(inspect);
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(link.getAttribute('href')).toBe(row.workshopUrl!);
    expect(link.target).toBe('_blank');
    expect(link.rel).toContain('noopener');
    link.addEventListener('click', event => event.preventDefault());
    link.click();
    expect(inspect).not.toHaveBeenCalled();
  });
  it('keeps unavailable workshops unlinked and respects busy receipt navigation', () => {
    const fixture = create({ ...row, workshopName: null, workshopUrl: null });
    fixture.componentRef.setInput('busy', true);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('a')).toBeNull();
    expect(element.querySelector<HTMLButtonElement>('.request-row__launch')?.disabled).toBeTrue();
    expect(element.querySelector<HTMLButtonElement>('.request-row__open')?.disabled).toBeTrue();
    expect(element.textContent).toContain('Workshop name unavailable');
  });
});
