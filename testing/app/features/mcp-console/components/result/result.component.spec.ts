import { TestBed } from '@angular/core/testing';
import { ResultComponent } from '../../../../../../src/app/features/mcp-console/components/result/result.component';
import type { CatalogResult } from '../../../../../../src/app/features/mcp-console/models/console.models';

describe('Catalog result presentation', () => {
  function render(result: CatalogResult) {
    TestBed.configureTestingModule({ imports: [ResultComponent] });
    const fixture = TestBed.createComponent(ResultComponent);
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
    return fixture;
  }
  it('renders workshop metadata and emits identifiers for inspection', () => {
    const fixture = render({
      name: 'list_workshops',
      raw: '{}',
      data: {
        workshops: [
          {
            id: 'intro',
            sectionId: 'angular',
            title: 'Angular intro',
            summary: 'Start here',
            level: 1,
          },
        ],
      },
    });
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.workshopSelected.subscribe(selected);
    (fixture.nativeElement as HTMLElement)
      .querySelector('button')!
      .click();
    expect(selected).toHaveBeenCalledWith({
      sectionId: 'angular',
      workshopId: 'intro',
    });
    expect(fixture.nativeElement.textContent).toContain(
      'Angular intro'
    );
  });
  it('preserves outline order and offers lab drilldown only for coding labs', () => {
    const fixture = render({
      name: 'get_workshop',
      raw: '{}',
      data: {
        workshop: {
          id: 'intro',
          sectionId: 'angular',
          title: 'Intro',
          summary: '',
          level: 1,
          outline: [
            {
              id: '1',
              title: 'Read first',
              kind: 'PAGE',
              resourceId: 'page',
            },
            {
              id: '2',
              title: 'Practice next',
              kind: 'CODING_LAB',
              resourceId: '0123456789abcdef01234567',
            },
          ],
        },
      },
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(
      [...el.querySelectorAll('li strong')].map(
        (item) => item.textContent
      )
    ).toEqual(['Read first', 'Practice next']);
    expect(el.querySelectorAll('button').length).toBe(1);
    const selected = jasmine.createSpy('selected');
    fixture.componentInstance.labSelected.subscribe(selected);
    el.querySelector('button')!.click();
    expect(selected).toHaveBeenCalledWith('0123456789abcdef01234567');
  });
  it('renders lab markdown and code as inert text with public tests', () => {
    const fixture = render({
      name: 'get_coding_lab',
      raw: '{}',
      data: {
        lab: {
          id: '0123456789abcdef01234567',
          versionId: '1123456789abcdef01234567',
          versionNumber: 1,
          title: 'A lab',
          language: 'typescript',
          promptMarkdown: '<img src=x onerror=alert(1)>',
          starterCode: 'const answer = 42;',
          hints: ['Try a function'],
          sampleTests: [
            {
              name: 'Public test',
              kind: 'io',
              input: 1,
              expected: 2,
            },
          ],
        },
      },
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('<img src=x onerror=alert(1)>');
    expect(el.querySelector('img')).toBeNull();
    expect(el.textContent).toContain('const answer = 42;');
    expect(el.textContent).toContain('Public test');
  });
});
