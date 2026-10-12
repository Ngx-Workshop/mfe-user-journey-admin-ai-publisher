import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ExampleMongodbDocCreateFormModalComponent } from '../../../../../../src/app/features/example-documents/components/editor/example-mongodb-doc-create-form-modal.component';
import { exampleDocument } from '../../../../../fixtures/example-document';

describe('Editor dialog composition', () => {
  it('submits nested form inputs, stays open on failure and closes only after successful retry', () => {
    const dialog = jasmine.createSpyObj('MatDialogRef', ['close'], { disableClose: false });
    TestBed.configureTestingModule({
      imports: [ExampleMongodbDocCreateFormModalComponent],
      providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting(),
        { provide: MAT_DIALOG_DATA, useValue: { mode: 'create' } },
        { provide: MatDialogRef, useValue: dialog }],
    });
    const fixture = TestBed.createComponent(ExampleMongodbDocCreateFormModalComponent);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const name = (fixture.nativeElement as HTMLElement).querySelector<HTMLInputElement>('input[formcontrolname="name"]')!;
    name.value = 'Created';
    name.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    const request = http.expectOne('/api/example-crud');
    expect(request.request.body.name).toBe('Created');
    request.flush({ message: 'Try later' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Try later');
    expect(name.value).toBe('Created');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    http.expectOne('/api/example-crud').flush(exampleDocument);
    http.expectOne('/api/example-crud').flush([exampleDocument]);
    expect(dialog.close).toHaveBeenCalledOnceWith(exampleDocument);
    http.verify();
  });
});
