import Ajv from 'ajv/dist/2020';
import { mcpCatalogContract } from '@tmdjr/service-mcp-gateway-contracts';
import type {
  GetCodingLabOutput,
  GetWorkshopOutput,
  ListWorkshopsOutput,
} from '@tmdjr/service-mcp-gateway-contracts';
import type { CallToolResult } from '@modelcontextprotocol/client';
import {
  CatalogDisplayError,
  type CatalogResult,
  type ToolName,
} from '../models/console.models';

const ajv = new Ajv({ strict: false });
const validators = Object.fromEntries(
  mcpCatalogContract.tools.map((tool) => [
    tool.name,
    ajv.compile(tool.outputSchema),
  ])
);
export function catalogResult(
  name: ToolName,
  response: CallToolResult
): CatalogResult {
  if (response.isError) {
    const text = response.content.find(
      (item) => item.type === 'text'
    );
    let message = 'The gateway could not complete this tool call.';
    if (text?.type === 'text') {
      try {
        const body: unknown = JSON.parse(text.text);
        if (body && typeof body === 'object' && 'error' in body) {
          const error = body.error;
          if (
            error &&
            typeof error === 'object' &&
            'message' in error &&
            typeof error.message === 'string'
          ) {
            message = error.message;
          }
        }
      } catch {
        /* Invalid tool error remains a safe generic message. */
      }
    }
    throw new CatalogDisplayError(message);
  }
  const data = response.structuredContent;
  if (!validators[name](data))
    throw new CatalogDisplayError(
      'The gateway returned an invalid catalog response.'
    );
  const raw = JSON.stringify(data, null, 2);
  // Published runtime schema validation above narrows the wire response to these DTOs.
  switch (name) {
    case 'list_workshops':
      return {
        name,
        data: data as unknown as ListWorkshopsOutput,
        raw,
      };
    case 'get_workshop':
      return {
        name,
        data: data as unknown as GetWorkshopOutput,
        raw,
      };
    case 'get_coding_lab':
      return {
        name,
        data: data as unknown as GetCodingLabOutput,
        raw,
      };
  }
}
