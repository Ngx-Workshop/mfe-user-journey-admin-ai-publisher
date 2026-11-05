import { documentEditorUrl } from '../../../../../src/app/features/workshop-publishing/utils/publishing-document-link';
import type { PublishingReceipt } from '../../../../../src/app/features/workshop-publishing/models/publishing.models';

type Step = PublishingReceipt['steps'][number];
const workshopId = '6acb08014d4ddb09fe850005';
const pageId = '6acb08014d4ddb09fe850006';
const secondPageId = '6acb08014d4ddb09fe850007';
const created: Step = {
  name: 'create_workshop',
  status: 'complete',
  result: {
    _id: workshopId,
    sectionId: 'angular',
    workshopDocumentGroupId: 'what-is-angular',
  },
};

describe('Documentation step editor links', () => {
  it('links direct page results to the page editor route', () => {
    const step: Step = {
      name: 'write_page_0',
      status: 'complete',
      result: {
        _id: pageId,
        workshopGroupId: workshopId,
        pageType: 'PAGE',
      },
    };
    expect(documentEditorUrl(step, [created, step])).toBe(
      '/document-editor/angular/what-is-angular/' + pageId
    );
  });
  it('selects the matching page from creation and naming workshop snapshots', () => {
    for (const name of ['create_page_1', 'name_page_1']) {
      const step: Step = {
        name,
        status: 'complete',
        result: {
          _id: workshopId,
          workshopDocuments: [
            { _id: secondPageId, kind: 'PAGE', sortId: 1 },
            {
              _id: '111111111111111111111111',
              kind: 'CODING_LAB',
              sortId: 1,
            },
            { _id: pageId, kind: 'PAGE', sortId: 0 },
          ],
        },
      };
      expect(documentEditorUrl(step, [created, step])).toBe(
        '/document-editor/angular/what-is-angular/' + secondPageId
      );
    }
  });
  it('does not confuse a workshop ID, unrelated page or pending result with the selected page', () => {
    const step: Step = {
      name: 'create_page_1',
      status: 'complete',
      result: {
        _id: workshopId,
        workshopDocuments: [{ _id: pageId, kind: 'PAGE', sortId: 0 }],
      },
    };
    expect(documentEditorUrl(step, [created, step])).toBeNull();
    expect(
      documentEditorUrl({ ...step, status: 'pending' }, [created])
    ).toBeNull();
    expect(
      documentEditorUrl({ ...step, name: 'create_workshop' }, [
        created,
      ])
    ).toBeNull();
    expect(
      documentEditorUrl(
        {
          ...step,
          result: {
            _id: pageId,
            workshopGroupId: 'another',
            pageType: 'PAGE',
          },
        },
        [created]
      )
    ).toBeNull();
    expect(documentEditorUrl(step, [])).toBeNull();
  });
  it('rejects malformed/ambiguous page identities and encodes route segments', () => {
    for (const id of ['../other', '', null, 12]) {
      const step: Step = {
        name: 'write_page_0',
        status: 'complete',
        result: {
          _id: id,
          workshopGroupId: workshopId,
          pageType: 'PAGE',
        },
      };
      expect(documentEditorUrl(step, [created])).toBeNull();
    }
    const duplicate: Step = {
      name: 'name_page_0',
      status: 'complete',
      result: {
        _id: workshopId,
        workshopDocuments: [
          { _id: pageId, kind: 'PAGE', sortId: 0 },
          { _id: secondPageId, kind: 'PAGE', sortId: 0 },
        ],
      },
    };
    expect(documentEditorUrl(duplicate, [created])).toBeNull();
    const encoded: Step = {
      ...created,
      result: {
        _id: workshopId,
        sectionId: 'angular/core',
        workshopDocumentGroupId: 'what?part#one',
      },
    };
    const page: Step = {
      name: 'write_page_0',
      status: 'complete',
      result: {
        _id: pageId,
        workshopGroupId: workshopId,
        pageType: 'PAGE',
      },
    };
    expect(documentEditorUrl(page, [encoded])).toBe(
      '/document-editor/angular%2Fcore/what%3Fpart%23one/' + pageId
    );
  });
});
