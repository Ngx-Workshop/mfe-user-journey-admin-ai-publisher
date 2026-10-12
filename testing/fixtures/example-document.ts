import type { ExampleMongodbDocDto } from '../../src/app/features/example-documents/models/example-document.models';
export const exampleDocument: ExampleMongodbDocDto = {
  _id: 'doc-1', name: 'Example', type: 'SOME_ENUM', description: 'A sample',
  archived: true, version: 1, lastUpdated: '2026-10-09T15:00:00Z', __v: 0,
};
