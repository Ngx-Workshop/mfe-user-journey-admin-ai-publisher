import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PublishingReviewComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-review.component';
import { PublishingProgressComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-progress.component';
import { PublishingLabPreviewComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-lab-preview.component';
import { PublishingDocumentPreviewComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-document-preview.component';
import { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('Workshop preview and activity', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
  );
  const draft: WorkshopDraft = {
    sectionId: 'angular',
    name: 'Functions',
    summary: 'Build typed helpers',
    level: 1,
    pages: [
      {
        name: 'Start here',
        blocks: [
          {
            blockId: 'a',
            sortIndex: 0,
            componentInstanceName: 'ParagraphBlockComponent',
            savedAction: '',
            dataClean: '<p>First page content</p>',
          },
        ],
      },
      {
        name: 'Next page',
        blocks: [
          {
            blockId: 'b',
            sortIndex: 0,
            componentInstanceName: 'ParagraphBlockComponent',
            savedAction: '',
            dataClean: '<p>Second page content</p>',
          },
        ],
      },
    ],
    labs: [],
    assessment: {
      name: 'Check your understanding',
      subject: 'angular',
      level: 1,
      testQuestions: [],
    },
  };
  it('opens the first page, changes outline selection, resets on new drafts and explains empty resources', () => {
    const fixture = TestBed.createComponent(
      PublishingReviewComponent
    );
    fixture.componentRef.setInput('draft', draft);
    fixture.componentRef.setInput('showPublish', false);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('First page content');
    expect(element.textContent).not.toContain('Second page content');
    const pages =
      element.querySelectorAll<HTMLButtonElement>('.review__item');
    pages[1].click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Second page content');
    expect(pages[1].getAttribute('aria-current')).toBe('true');
    const button = (text: string) =>
      [...element.querySelectorAll('button')].find((button) =>
        button.textContent?.includes(text)
      )!;
    button('Coding labs').click();
    fixture.detectChanges();
    expect(element.textContent).toContain(
      'No coding labs to preview'
    );
    button('Assessment').click();
    fixture.detectChanges();
    expect(element.textContent).toContain('No assessment questions');
    fixture.componentRef.setInput('draft', {
      ...draft,
      name: 'Revised draft',
    });
    fixture.detectChanges();
    expect(element.textContent).toContain('First page content');
  });
  it('sorts document blocks, renders images/code, sanitizes markup and labels interactive source fallbacks', () => {
    const fixture = TestBed.createComponent(
      PublishingDocumentPreviewComponent
    );
    fixture.componentRef.setInput('page', {
      name: 'Preview',
      blocks: [
        {
          blockId: 'code',
          sortIndex: 4,
          componentInstanceName: 'NgxEditorJs2CodemirrorComponent',
          savedAction: '',
          dataClean: JSON.stringify({ code: 'const result = 42;' }),
        },
        {
          blockId: 'p',
          sortIndex: 0,
          componentInstanceName: 'ParagraphBlockComponent',
          savedAction: '',
          dataClean:
            '<p>Readable text<script>alert(1)</script><img src="x" onerror="alert(1)"></p>',
        },
        {
          blockId: 'img',
          sortIndex: 1,
          componentInstanceName: 'NgxEditorJs2ImageComponent',
          savedAction: '',
          dataClean: JSON.stringify({
            url: 'https://assets.example/preview.png',
            title: 'Diagram image',
          }),
        },
        {
          blockId: 'bad',
          sortIndex: 2,
          componentInstanceName: 'NgxEditorJs2ImageComponent',
          savedAction: '',
          dataClean: '{"url":"javascript:alert(1)"}',
        },
        {
          blockId: 'diagram',
          sortIndex: 3,
          componentInstanceName: 'NgxEditorJs2MermaidjsComponent',
          savedAction: '',
          dataClean: 'flowchart LR; A-->B',
        },
      ],
    });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('script')).toBeNull();
    expect(element.querySelector('[onerror]')).toBeNull();
    expect(
      element.querySelector('figure img')?.getAttribute('src')
    ).toBe('https://assets.example/preview.png');
    expect(element.textContent).toContain(
      'Image unavailable · source preview'
    );
    expect(element.textContent).toContain('Diagram · source preview');
    expect(element.textContent).toContain('const result = 42;');
    expect(
      element.textContent!.indexOf('Readable text')
    ).toBeLessThan(element.textContent!.indexOf('const result'));
  });
  it('renders Markdown instructions through sanitized HTML and keeps solution/tests separate', () => {
    const fixture = TestBed.createComponent(
      PublishingLabPreviewComponent
    );
    fixture.componentRef.setInput('lab', {
      metadata: {
        title: 'Typed helpers',
        slug: 'helpers',
        summary: 'Build a helper',
        difficulty: 'intro',
      },
      version: {
        language: 'typescript',
        promptMarkdown:
          '# The task\n\nUse **typed functions**.\n\n- Accept a number\n- Return a value\n\n<script>alert(1)</script><img src="x" onerror="alert(1)">',
        hints: ['Try a return type'],
        starterCode: 'export function answer() {}',
        referenceSolution: {
          code: 'export function answer() { return 42; }',
        },
        sampleTests: [],
        hiddenTests: [],
        runner: { timeoutMs: 1000, entryFnName: 'answer' },
      },
    });
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(
      element.querySelector('.lab__instructions h1')?.textContent
    ).toBe('The task');
    expect(
      element.querySelector('.lab__instructions strong')?.textContent
    ).toBe('typed functions');
    expect(
      element.querySelectorAll('.lab__instructions li').length
    ).toBe(2);
    expect(element.querySelector('script')).toBeNull();
    expect(element.querySelector('[onerror]')).toBeNull();
    expect(element.querySelectorAll('details').length).toBe(3);
    expect(element.textContent).toContain(
      'Code is not executed here'
    );
    expect(element.textContent).toContain('No sample tests');
  });
  it('reports the actual operation and elapsed wait without inventing a percent or backend substages', () => {
    const fixture = TestBed.createComponent(
      PublishingProgressComponent
    );
    fixture.componentRef.setInput('operation', 'generate');
    fixture.componentRef.setInput('elapsed', 65);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('1:05 elapsed');
    expect(
      element.querySelector('[aria-current=step]')?.textContent
    ).toContain('Waiting for the complete draft');
    expect(element.textContent).toContain(
      'Nothing has been published'
    );
    expect(element.textContent).toContain('Still waiting');
    expect(element.textContent).not.toContain('%');
    fixture.componentRef.setInput('operation', 'validate');
    fixture.detectChanges();
    expect(element.textContent).toContain(
      'Validating workshop draft'
    );
    expect(element.querySelector('ol')).toBeNull();
  });
});
