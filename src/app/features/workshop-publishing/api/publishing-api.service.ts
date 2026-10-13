import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import Ajv from 'ajv/dist/2020';
import {
  mcpCatalogContract,
  type WorkshopDraft,
} from '@tmdjr/service-mcp-gateway-contracts';
import {
  PublisherTool,
  PublishingReceipt,
} from '../models/publishing.models';
const draftTool = mcpCatalogContract.publishing.tools.find(
  (t) => t.name === 'validate_workshop_draft'
)!;
const validateDraft = new Ajv({ strict: false }).compile<{
  draft: WorkshopDraft;
}>(draftTool.inputSchema);
@Injectable({ providedIn: 'root' })
export class PublishingApiService {
  private readonly http = inject(HttpClient);
  async call(name: PublisherTool, input: unknown): Promise<unknown> {
    const response = await firstValueFrom(
      this.http
        .post<unknown>(
          '/api/publisher/tools',
          { name, input },
          { withCredentials: true }
        )
        .pipe(timeout(180000))
    );
    if (!response || typeof response !== 'object')
      throw new Error('Invalid publishing response.');
    if ('isError' in response && response.isError === true)
      throw new Error(
        'The publishing agent could not complete this request. Check the draft, service access and server configuration.'
      );
    if (
      !('structuredContent' in response) ||
      !response.structuredContent ||
      typeof response.structuredContent !== 'object' ||
      !('data' in response.structuredContent)
    )
      throw new Error('Invalid publishing response.');
    return response.structuredContent.data;
  }
  async sections(): Promise<{ id: string; name: string }[]> {
    const value = await this.call('manage_document', {
      operation: 'sections',
    });
    if (
      !value ||
      typeof value !== 'object' ||
      !('sections' in value) ||
      !value.sections ||
      typeof value.sections !== 'object'
    )
      throw new Error('Invalid section response.');
    return Object.entries(value.sections).map(
      ([id, section]: [string, unknown]) => {
        if (
          !section ||
          typeof section !== 'object' ||
          !('sectionTitle' in section) ||
          typeof section.sectionTitle !== 'string'
        )
          throw new Error('Invalid section response.');
        return { id, name: section.sectionTitle };
      }
    );
  }
  draft(value: unknown): WorkshopDraft {
    const envelope = { draft: value };
    if (!validateDraft(envelope))
      throw new Error(
        'The draft does not match the workshop format. Validate its documentation, labs and assessment.'
      );
    return envelope.draft;
  }
  receipt(value: unknown): PublishingReceipt {
    if (
      !value ||
      typeof value !== 'object' ||
      !('requestId' in value) ||
      typeof value.requestId !== 'string' ||
      !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(
        value.requestId
      ) ||
      !('subject' in value) ||
      typeof value.subject !== 'string' ||
      !('draftHash' in value) ||
      typeof value.draftHash !== 'string' ||
      !('status' in value) ||
      !['running', 'complete', 'needs_recovery'].includes(
        String(value.status)
      ) ||
      !('steps' in value) ||
      !Array.isArray(value.steps) ||
      value.steps.some(
        (s) =>
          !s ||
          typeof s !== 'object' ||
          typeof s.name !== 'string' ||
          !['pending', 'complete'].includes(s.status)
      )
    )
      throw new Error('Invalid publishing receipt.');
    return value as PublishingReceipt;
  }
}
