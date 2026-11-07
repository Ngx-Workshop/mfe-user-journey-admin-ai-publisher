import { WorkshopDraft } from '../models/publishing.models';

export function repairChanges(before: WorkshopDraft, after: WorkshopDraft): string[] {
  const changes: string[] = [];
  const pages = (draft: WorkshopDraft) => draft.pages.map(page => ({ name: page.name,
    blocks: page.blocks.map(block => ({ componentInstanceName: block.componentInstanceName,
      savedAction: block.savedAction, dataClean: block.dataClean, sortIndex: block.sortIndex })) }));
  function compare<T>(old: T[], next: T[], label: string, name: (value: T) => string) {
    for (let index = 0; index < Math.max(old.length, next.length); index++) {
      if (!old[index]) changes.push(`Added ${label}: ${name(next[index])}`);
      else if (!next[index]) changes.push(`Removed ${label}: ${name(old[index])}`);
      else if (JSON.stringify(old[index]) !== JSON.stringify(next[index]))
        changes.push(`Updated ${label}: ${name(next[index])}`);
    }
  }
  compare(pages(before), pages(after), 'page', page => page.name);
  compare(before.labs, after.labs, 'coding lab', lab => lab.metadata.title);
  if (JSON.stringify(before.assessment) !== JSON.stringify(after.assessment)) changes.push('Updated assessment questions or answers');
  if (JSON.stringify([before.name, before.summary, before.sectionId, before.level, before.learningPlan]) !==
      JSON.stringify([after.name, after.summary, after.sectionId, after.level, after.learningPlan])) changes.push('Updated workshop overview or learning plan');
  return changes;
}
