import { publishingProgress, publishingStepLabel } from '../../../../../src/app/features/workshop-publishing/utils/publishing-step-display';

describe('Publishing step presentation', () => {
  it('summarizes progress and counts resources without double-counting their substeps', () => {
    const names = ['create_workshop', 'write_page_0', 'name_page_0', 'create_page_1',
      'create_page_2', 'create_page_3', 'create_lab_0', 'create_version_0', 'verify_lab_0'];
    expect(publishingProgress(names.map((name, index) => ({name, status: index === 8 ? 'pending' : 'complete'}))))
      .toBe('8 of 9 publishing steps complete · 4 documentation pages · 1 coding lab');
    expect(publishingProgress([])).toBe('No publishing steps reported yet.');
  });
  it('labels operations with one-based numbers and humanizes unknown operations', () => {
    expect(publishingStepLabel('write_page_0')).toBe('Write documentation page 1');
    expect(publishingStepLabel('name_page_0')).toBe('Name documentation page 1');
    expect(publishingStepLabel('create_version_0')).toBe('Create version for coding lab 1');
    expect(publishingStepLabel('verify_lab_0')).toBe('Verify coding lab 1');
    expect(publishingStepLabel('new_operation_3')).toBe('New operation 4');
    expect(publishingStepLabel('Documents')).toBe('Documents');
  });
});
