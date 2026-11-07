export type {
  SavedWorkshopDraft,
  WorkshopDraftSummary,
  PreparationReport,
  PreparationRepairOptions,
  PreparationActivity,
  StartWorkshopPreparationInput,
  WorkshopDraft,
  EditorBlock,
  PublishingReceipt,
  PublishingModelCatalog,
  PublishingModel,
  WorkshopImageInput,
  GenerateWorkshopDraftInput,
} from '@tmdjr/service-ai-publisher-contracts';
export interface WorkshopImage {
  name: string;
  storageUrl: string;
}
export type PublisherTool =
  | 'list_workshop_drafts'
  | 'get_workshop_draft'
  | 'save_workshop_draft'
  | 'get_workshop_repair_options'
  | 'start_workshop_preparation'
  | 'get_workshop_preparation'
  | 'list_publishing_models'
  | 'list_publishing_runs'
  | 'generate_workshop_draft'
  | 'validate_workshop_draft'
  | 'publish_workshop'
  | 'get_publishing_run'
  | 'manage_document'
  | 'workshop_image';
