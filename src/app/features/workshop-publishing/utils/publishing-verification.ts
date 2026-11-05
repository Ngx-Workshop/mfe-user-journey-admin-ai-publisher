import type { PublishingReceipt } from '../models/publishing.models';

type Step = PublishingReceipt['steps'][number];
export interface LabVerification {
  passed: boolean;
  passedTests: number | null;
  totalTests: number | null;
}

export function labVerification(step: Step): LabVerification | null {
  if (
    !/^verify_lab_\d+$/.test(step.name) ||
    step.status !== 'complete'
  )
    return null;
  const result = record(step.result);
  if (typeof result?.['passed'] !== 'boolean') return null;
  const count = (value: unknown): number | null =>
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value >= 0
      ? value
      : null;
  const total = count(result['totalTests']);
  const passed = count(result['passedTests']);
  return {
    passed: result['passed'],
    totalTests:
      total !== null && passed !== null && passed <= total
        ? total
        : null,
    passedTests:
      total !== null && passed !== null && passed <= total
        ? passed
        : null,
  };
}

export function codingLabEditorUrl(
  step: Step,
  steps: PublishingReceipt['steps']
): string | null {
  if (step.status !== 'complete') return null;
  const match =
    /^(?:create_lab|create_version|verify_lab)_(\d+)$/.exec(
      step.name
    );
  if (!match) return null;
  const created = steps.find(
    (candidate) =>
      candidate.name === `create_lab_${match[1]}` &&
      candidate.status === 'complete'
  );
  const id = record(created?.result)?.['_id'];
  return typeof id === 'string' && /^[a-f\d]{24}$/i.test(id)
    ? `/coding-labs-editor/coding-labs/${encodeURIComponent(id)}`
    : null;
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}
