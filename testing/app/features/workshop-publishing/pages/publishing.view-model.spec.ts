import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { PublishingViewModel } from '../../../../../src/app/features/workshop-publishing/pages/publishing.view-model';
import { PublishingStore } from '../../../../../src/app/features/workshop-publishing/state/publishing.store';
import type { WorkshopDraft } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';
describe('PublishingViewModel', () => {
  let vm: PublishingViewModel;
  const draft: WorkshopDraft = {sectionId:'angular',name:'Functions',summary:'Learn functions',level:1,pages:[],labs:[],assessment:{name:'Quiz',subject:'angular',level:1,testQuestions:[]}};
  let store: {busy: ReturnType<typeof signal<boolean>>; error: ReturnType<typeof signal<string>>; sections: ReturnType<typeof signal<{ id: string; name: string }[]>>; loadSections: jasmine.Spy; draft: jasmine.Spy; publish: jasmine.Spy; receipt: jasmine.Spy};
  beforeEach(() => {
    store = {busy: signal(false), error: signal(''), sections: signal<{ id: string; name: string }[]>([]), loadSections: jasmine.createSpy().and.resolveTo(), draft: jasmine.createSpy().and.resolveTo(draft), publish: jasmine.createSpy().and.resolveTo(undefined), receipt: jasmine.createSpy().and.resolveTo(undefined)};
    TestBed.configureTestingModule({ providers: [PublishingViewModel, {provide:PublishingStore,useValue:store}] });
    vm=TestBed.inject(PublishingViewModel);
  });
  it('requires a valid brief, validates changes, and clears the reviewed draft on edit', async () => {
    await vm.generate(); expect(store.draft).not.toHaveBeenCalled();
    vm.form.setValue({brief:'Teach functions',sectionId:'angular',level:1});
    await vm.generate(); expect(vm.draft()).toEqual(draft);
    vm.edited(); expect(vm.draft()).toBeNull();
    await vm.validate(); expect(vm.draft()).toEqual(draft);
  });
  it('keeps draft and request ID after a failed publish and blocks duplicate attempts', async () => {
    vm.form.setValue({brief:'Teach functions',sectionId:'angular',level:1}); await vm.generate();
    const id=vm.requestId(); await vm.publish(); await vm.publish();
    expect(store.publish).toHaveBeenCalledTimes(1); expect(vm.requestId()).toBe(id); expect(vm.draft()).toEqual(draft);
    await vm.inspect(); expect(store.receipt).toHaveBeenCalledWith(id);
  });
});
