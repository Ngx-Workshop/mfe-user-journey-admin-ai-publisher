import type { PublishingReceipt } from '../models/publishing.models';

/** Workshop identity belongs to the completed creation step, not later resource results. */
export function workshopSummary(steps: PublishingReceipt['steps']): {
  workshopName: string | null; workshopUrl: string | null;
} {
  const first = steps[0];
  const result = first?.result;
  if (first?.name !== 'create_workshop' || first.status !== 'complete' ||
      !result || typeof result !== 'object' || Array.isArray(result)) {
    return { workshopName: null, workshopUrl: null };
  }
  const workshopName = 'name' in result && typeof result.name === 'string' ? result.name.trim() || null : null;
  const section = 'sectionId' in result && typeof result.sectionId === 'string' ? result.sectionId.trim() : '';
  const group = 'workshopDocumentGroupId' in result && typeof result.workshopDocumentGroupId === 'string'
    ? result.workshopDocumentGroupId.trim() : '';
  const valid = (segment: string) => !!segment && segment !== '.' && segment !== '..';
  return { workshopName, workshopUrl: valid(section) && valid(group)
    ? `/document-editor/${encodeURIComponent(section)}/${encodeURIComponent(group)}` : null };
}
