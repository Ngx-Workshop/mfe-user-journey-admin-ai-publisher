export type { PreparationReport, PreparationActivity, StartWorkshopPreparationInput } from '@tmdjr/service-mcp-gateway-contracts';
export type {
  WorkshopDraft,
  EditorBlock,
} from '@tmdjr/service-mcp-gateway-contracts';
export type { PublishingReceipt } from '@tmdjr/service-mcp-gateway-contracts';
export type {
  PublishingModelCatalog,
  PublishingModel,
  WorkshopImageInput,
  GenerateWorkshopDraftInput,
} from '@tmdjr/service-mcp-gateway-contracts';
export interface WorkshopImage {
  name: string;
  storageUrl: string;
}
export type PublisherTool =
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
