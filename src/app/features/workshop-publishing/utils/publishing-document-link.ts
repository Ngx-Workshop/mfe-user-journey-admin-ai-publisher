import type { PublishingReceipt } from '../models/publishing.models';
import { workshopSummary } from './publishing-workshop-summary';

type Step = PublishingReceipt['steps'][number];

/** Page writes return a page; page creation/renaming can return the workshop. */
export function documentEditorUrl(
  step: Step,
  steps: PublishingReceipt['steps']
): string | null {
  if (step.status !== 'complete') return null;
  const match = /^(?:create|write|name)_page_(\d+)$/.exec(step.name);
  if (!match) return null;
  const base = workshopSummary(steps).workshopUrl;
  const workshop = record(steps[0]?.result);
  const workshopId = workshop?.['_id'];
  const result = record(step.result);
  if (!base || !mongoId(workshopId) || !result) return null;

  let pageId: unknown;
  if (
    result['workshopGroupId'] === workshopId &&
    result['pageType'] === 'PAGE'
  ) {
    pageId = result['_id'];
  } else if (
    result['_id'] === workshopId &&
    Array.isArray(result['workshopDocuments'])
  ) {
    const matches = result['workshopDocuments']
      .map(record)
      .filter(
        (page) =>
          page?.['kind'] === 'PAGE' &&
          page['sortId'] === Number(match[1])
      );
    if (matches.length === 1) pageId = matches[0]?.['_id'];
  }
  return mongoId(pageId)
    ? `${base}/${encodeURIComponent(pageId)}`
    : null;
}

function mongoId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}
function record(value: unknown): Record<string, unknown> | null {
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
