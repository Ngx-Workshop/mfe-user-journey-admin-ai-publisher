export type {
  CreateExampleMongodbDocDto,
  ExampleMongodbDocDto,
  UpdateExampleMongodbDocDto,
} from '@tmdjr/seed-service-nestjs-contracts';
import type { ExampleMongodbDocDto } from '@tmdjr/seed-service-nestjs-contracts';

export interface ExampleFormDialogData {
  mode: 'create' | 'edit';
  doc?: ExampleMongodbDocDto;
}
