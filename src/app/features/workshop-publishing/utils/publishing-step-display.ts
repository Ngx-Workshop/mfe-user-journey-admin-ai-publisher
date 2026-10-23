import type { PublishingReceipt } from '../models/publishing.models';

/** Operation indices are zero-based; display item numbers from one. */
export function publishingStepLabel(name: string): string {
  if (name === 'create_workshop') return 'Create workshop';
  const page = /^(create|write|name)_page_(\d+)$/.exec(name);
  if (page) {
    const actions: Record<string, string> = { create: 'Create', write: 'Write', name: 'Name' };
    return `${actions[page[1]]} documentation page ${Number(page[2]) + 1}`;
  }
  const lab = /^(create_lab|create_version|verify_lab)_(\d+)$/.exec(name);
  if (lab) {
    const actions: Record<string, string> = { create_lab: 'Create coding lab',
      create_version: 'Create version for coding lab', verify_lab: 'Verify coding lab' };
    return `${actions[lab[1]]} ${Number(lab[2]) + 1}`;
  }
  const readable = name.replace(/_(\d+)$/, (_, index: string) => ` ${Number(index) + 1}`)
    .replace(/[_-]+/g, ' ').trim();
  return readable ? readable[0].toUpperCase() + readable.slice(1) : 'Publishing step';
}

export function publishingProgress(steps: PublishingReceipt['steps']): string {
  if (!steps.length) return 'No publishing steps reported yet.';
  const completed = steps.filter((step) => step.status === 'complete').length;
  const pages = new Set<string>();
  const labs = new Set<string>();
  for (const step of steps) {
    const page = /^(?:create|write|name)_page_(\d+)$/.exec(step.name);
    const lab = /^(?:create_lab|create_version|verify_lab)_(\d+)$/.exec(step.name);
    if (page) pages.add(page[1]);
    if (lab) labs.add(lab[1]);
  }
  return [
    `${completed} of ${steps.length} publishing steps complete`,
    ...(pages.size ? [`${pages.size} documentation ${pages.size === 1 ? 'page' : 'pages'}`] : []),
    ...(labs.size ? [`${labs.size} coding ${labs.size === 1 ? 'lab' : 'labs'}`] : []),
  ].join(' · ');
}
