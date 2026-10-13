import type {
  CallToolResult,
  Tool,
} from '@modelcontextprotocol/client';
import type {
  GetCodingLabInput,
  GetCodingLabOutput,
  GetWorkshopInput,
  GetWorkshopOutput,
  ListWorkshopsInput,
  ListWorkshopsOutput,
} from '@tmdjr/service-mcp-gateway-contracts';

export type ToolName =
  'list_workshops' | 'get_workshop' | 'get_coding_lab';
export type ToolInput =
  ListWorkshopsInput | GetWorkshopInput | GetCodingLabInput;
export interface ConnectionSettings {
  endpoint: string;
  token: string;
  expiresAt?: number;
}
export interface McpConnection {
  server: string;
  tools: Tool[];
  call(name: ToolName, input: ToolInput): Promise<CallToolResult>;
  close(): Promise<void>;
}
export type CatalogResult =
  | { name: 'list_workshops'; data: ListWorkshopsOutput; raw: string }
  | { name: 'get_workshop'; data: GetWorkshopOutput; raw: string }
  | { name: 'get_coding_lab'; data: GetCodingLabOutput; raw: string };
export const toolChoices: ReadonlyArray<{
  name: ToolName;
  title: string;
  description: string;
}> = [
  {
    name: 'list_workshops',
    title: 'Explore workshops',
    description: 'Browse the public catalog for a section.',
  },
  {
    name: 'get_workshop',
    title: 'Inspect a workshop',
    description: 'Read metadata and the ordered learning outline.',
  },
  {
    name: 'get_coding_lab',
    title: 'Read a coding lab',
    description:
      'View a published prompt, starter code and sample tests.',
  },
];

export class CatalogDisplayError extends Error {}
