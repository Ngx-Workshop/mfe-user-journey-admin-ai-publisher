import { workshopSummary } from '../../../../../src/app/features/workshop-publishing/utils/publishing-workshop-summary';
import type { PublishingReceipt } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

describe('Workshop identity from publishing receipts', () => {
  const result = {
    name: 'Pure TypeScript Functions',
    sectionId: 'angular',
    workshopDocumentGroupId: 'pure-type-script-functions',
  };
  const step: PublishingReceipt['steps'][number] = {
    name: 'create_workshop',
    status: 'complete',
    result,
  };
  it('reads name and workshop route from the completed first creation step', () => {
    expect(workshopSummary([step])).toEqual({
      workshopName: result.name,
      workshopUrl:
        '/document-editor/angular/pure-type-script-functions',
    });
  });
  it('does not infer identity from a pending, missing, or later creation result', () => {
    for (const steps of [
      [],
      [{ ...step, status: 'pending' as const }],
      [{ ...step, name: 'write_page_0' }, step],
    ]) {
      expect(workshopSummary(steps)).toEqual({
        workshopName: null,
        workshopUrl: null,
      });
    }
  });
  it('handles malformed/missing routing values without producing a link', () => {
    for (const value of [
      null,
      [],
      'bad',
      { ...result, sectionId: 1 },
      { ...result, workshopDocumentGroupId: '' },
      { ...result, sectionId: '..' },
    ]) {
      expect(
        workshopSummary([{ ...step, result: value }]).workshopUrl
      ).toBeNull();
    }
    expect(
      workshopSummary([{ ...step, result: { name: 'Name only' } }])
        .workshopName
    ).toBe('Name only');
  });
  it('encodes route segments rather than interpreting delimiters as navigation', () => {
    expect(
      workshopSummary([
        {
          ...step,
          result: {
            ...result,
            sectionId: 'angular/core',
            workshopDocumentGroupId: 'functions?edit#part',
          },
        },
      ]).workshopUrl
    ).toBe('/document-editor/angular%2Fcore/functions%3Fedit%23part');
  });
});
