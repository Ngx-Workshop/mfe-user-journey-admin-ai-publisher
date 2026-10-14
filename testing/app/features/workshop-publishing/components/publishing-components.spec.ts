import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PublishingBriefComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-brief.component';
import { PublishingSourceComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-source.component';
import { PublishingReviewComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-review.component';
import { PublishingReceiptsComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-receipts.component';
import { PublishingModelComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-model.component';
import { PublishingImagesComponent } from '../../../../../src/app/features/workshop-publishing/components/publishing-images.component';
import type { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('Publishing presentation components', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  }));

  it('renders section choices and emits a valid brief submission without a store', () => {
    const fixture = TestBed.createComponent(PublishingBriefComponent);
    const form = new FormGroup({
      brief: new FormControl('Functions', { nonNullable: true, validators: [Validators.required] }),
      sectionId: new FormControl('angular', { nonNullable: true }),
      level: new FormControl(1, { nonNullable: true }),
    });
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('sections', [{ id: 'angular', name: 'Angular' }]);
    fixture.componentRef.setInput('modelValid', true);
    const generate = jasmine.createSpy();
    fixture.componentInstance.generate.subscribe(generate);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Angular');
    element.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(generate).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    expect(element.querySelector('button')?.disabled).toBeTrue();
    expect(element.querySelector('textarea')?.readOnly).toBeTrue();
  });

  it('binds imported JSON to its control and emits validation intent', () => {
    const fixture = TestBed.createComponent(PublishingSourceComponent);
    const json = new FormControl('', { nonNullable: true });
    fixture.componentRef.setInput('json', json);
    const validate = jasmine.createSpy();
    fixture.componentInstance.validate.subscribe(validate);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    const textarea = element.querySelector('textarea')!;
    textarea.value = '{"name":"Functions"}';
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    expect(json.value).toBe(textarea.value);
    element.querySelector('button')?.click();
    expect(validate).toHaveBeenCalledTimes(1);
  });

  it('renders documentation, lab resources and assessment and emits publish intent', () => {
    const fixture = TestBed.createComponent(PublishingReviewComponent);
    const draft: WorkshopDraft = {
      sectionId: 'angular', name: 'Functions', summary: 'Learn functions', level: 1,
      pages: [{
        name: 'Introduction', blocks: [
          { blockId: 'paragraph', sortIndex: 0, componentInstanceName: 'ParagraphBlockComponent',
            savedAction: 'medium', dataClean: '<p>Documentation text</p>' },
          { blockId: 'code', sortIndex: 1, componentInstanceName: 'NgxEditorJs2CodemirrorComponent',
            savedAction: '', dataClean: 'const answer = 42;' },
        ],
      }],
      labs: [{
        metadata: { title: 'Function lab', slug: 'function-lab', summary: 'Implement a function', difficulty: 'intro' },
        version: {
          language: 'typescript', promptMarkdown: 'Return the answer', hints: [],
          starterCode: 'function answer() {}', referenceSolution: { code: 'function answer() { return 42; }' },
          sampleTests: [{ name: 'returns 42', kind: 'io', expected: 42 }],
          hiddenTests: [], runner: { timeoutMs: 1000, entryFnName: 'answer' },
        },
      }],
      assessment: {
        name: 'Quiz', subject: 'angular', level: 1,
        testQuestions: [{
          question: 'What is returned?', choices: [{ value: '42' }], answer: '42',
          correctResponse: 'Correct answer', incorrectResponse: 'Try again',
        }],
      },
    };
    fixture.componentRef.setInput('draft', draft);
    const publish = jasmine.createSpy();
    fixture.componentInstance.publish.subscribe(publish);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Functions');
    expect(element.querySelector('.review__block p')?.textContent).toBe('Documentation text');
    expect(element.querySelector('pre')?.textContent).toContain('const answer = 42;');
    expect(element.textContent).toContain('Assessment: Quiz');
    expect(element.textContent).toContain('Coding lab: Function lab');
    expect(element.textContent).toContain('function answer() {}');
    expect(element.textContent).toContain('"referenceSolution"');
    expect(element.textContent).toContain('"returns 42"');
    expect(element.textContent).toContain('What is returned?');
    expect(element.textContent).toContain('Answer: 42');
    element.querySelector('button')?.click();
    expect(publish).toHaveBeenCalledTimes(1);
    fixture.componentRef.setInput('locked', true);
    fixture.detectChanges();
    element.querySelector('button')?.click();
    expect(publish).toHaveBeenCalledTimes(1);
  });

  it('renders empty history and recovery status and emits receipt intent', () => {
    const fixture = TestBed.createComponent(PublishingReceiptsComponent);
    const id = crypto.randomUUID();
    fixture.componentRef.setInput('history', []);
    fixture.componentRef.setInput('unconfirmed', []);
    fixture.componentRef.setInput('requestId', id);
    fixture.componentRef.setInput('receiptId', new FormControl('', { nonNullable: true }));
    const inspect = jasmine.createSpy();
    const inspectHistory = jasmine.createSpy();
    const refresh = jasmine.createSpy();
    fixture.componentInstance.inspect.subscribe(inspect);
    fixture.componentInstance.inspectHistory.subscribe(inspectHistory);
    fixture.componentInstance.refresh.subscribe(refresh);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('No publishing requests found.');
    fixture.componentRef.setInput('unconfirmed', [id]);
    fixture.componentRef.setInput('attempted', true);
    fixture.componentRef.setInput('receipt', {
      requestId: id, subject: 'admin', draftHash: 'hash', status: 'needs_recovery',
      message: 'Check owner resources', steps: [{ name: 'Documents', status: 'complete', result: { id: 1 } }],
    });
    fixture.detectChanges();
    const buttons = Array.from(element.querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Inspect receipt'))?.click();
    buttons.find((button) => button.textContent?.includes('Refresh history'))?.click();
    buttons.find((button) => button.textContent?.includes('Check publishing receipt'))?.click();
    expect(inspectHistory).toHaveBeenCalledWith(id);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(inspect).toHaveBeenCalledTimes(1);
    expect(element.textContent).toContain('Receipt unconfirmed');
    expect(element.textContent).toContain('Keep this ID.');
    expect(element.querySelector('[role="status"]')?.textContent).toContain('Publishing needs attention');
    expect(element.querySelector('pre')?.textContent).toContain('"id": 1');
  });

  it('renders unknown model prices and persistent setup errors and emits reload', () => {
    const fixture = TestBed.createComponent(PublishingModelComponent);
    fixture.componentRef.setInput('model', new FormControl('test', { nonNullable: true }));
    fixture.componentRef.setInput('catalog', {
      models: [{ id: 'test', inputUsdPerMillion: null, outputUsdPerMillion: 2 }],
      defaultModel: 'test', imageModel: 'image',
    });
    fixture.componentRef.setInput('errors', ['Section access failed']);
    const reload = jasmine.createSpy();
    fixture.componentInstance.reload.subscribe(reload);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('Price unavailable input');
    expect(element.textContent).toContain('$2.00 output');
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Section access failed');
    element.querySelector('button')?.click();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('renders empty assets and selected preview and emits all image intents', () => {
    const fixture = TestBed.createComponent(PublishingImagesComponent);
    fixture.componentRef.setInput('query', new FormControl('', { nonNullable: true }));
    fixture.componentRef.setInput('prompt', new FormControl('Illustration', { nonNullable: true }));
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.textContent).toContain('No image assets loaded.');
    const image = { name: 'Illustration', storageUrl: 'https://assets.example/image.png' };
    fixture.componentRef.setInput('images', [image]);
    fixture.componentRef.setInput('selected', image);
    fixture.componentRef.setInput('hasDraft', true);
    const select = jasmine.createSpy();
    const browse = jasmine.createSpy();
    const generate = jasmine.createSpy();
    const apply = jasmine.createSpy();
    fixture.componentInstance.select.subscribe(select);
    fixture.componentInstance.browse.subscribe(browse);
    fixture.componentInstance.generate.subscribe(generate);
    fixture.componentInstance.apply.subscribe(apply);
    fixture.detectChanges();
    element.querySelector<HTMLButtonElement>('[aria-label="Select Illustration"]')?.click();
    const buttons = Array.from(element.querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Browse image assets'))?.click();
    buttons.find((button) => button.textContent?.includes('Generate workshop image'))?.click();
    buttons.find((button) => button.textContent?.includes('Add image to workshop draft'))?.click();
    expect(select).toHaveBeenCalledWith(image);
    expect(browse).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(apply).toHaveBeenCalledTimes(1);
    expect(element.querySelector('figure img')?.getAttribute('alt')).toBe(image.name);
  });
});
