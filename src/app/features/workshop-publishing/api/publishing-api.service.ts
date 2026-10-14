import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, timeout } from 'rxjs';
import Ajv from 'ajv/dist/2020';
import { publishingError } from './publishing-error';
import {
  mcpCatalogContract,
  type WorkshopDraft,
} from '@tmdjr/service-mcp-gateway-contracts';
import {
  PublisherTool,
  PublishingReceipt,
  PublishingModelCatalog,
  WorkshopImage,
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
      throw new Error(publishingError(response));
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
  async models(): Promise<PublishingModelCatalog> {
    const value = await this.call('list_publishing_models', {});
    const schema = mcpCatalogContract.publishing.tools.find(
      (t) => t.name === 'list_publishing_models'
    );
    // The tool envelope is generic; validate consumed catalog fields explicitly.
    if (
      !schema ||
      !value ||
      typeof value !== 'object' ||
      !('models' in value) ||
      !Array.isArray(value.models) ||
      !('defaultModel' in value) ||
      !(
        value.defaultModel === null ||
        typeof value.defaultModel === 'string'
      ) ||
      !('imageModel' in value) ||
      typeof value.imageModel !== 'string' ||
      value.models.some(
        (m) =>
          !m ||
          typeof m.id !== 'string' ||
          !m.id ||
          ![m.inputUsdPerMillion, m.outputUsdPerMillion].every(
            (p) =>
              p === null ||
              (typeof p === 'number' && Number.isFinite(p) && p >= 0)
          )
      )
    )
      throw new Error('Invalid model catalog.');
    return value as PublishingModelCatalog;
  }
  async history(): Promise<PublishingReceipt[]> {
    const value = await this.call('list_publishing_runs', {});
    if (!Array.isArray(value))
      throw new Error('Invalid publishing history.');
    return value.map((receipt) => this.receipt(receipt));
  }
  image(value: unknown): WorkshopImage {
    if (
      !value ||
      typeof value !== 'object' ||
      !('name' in value) ||
      typeof value.name !== 'string' ||
      !('storageUrl' in value) ||
      typeof value.storageUrl !== 'string'
    )
      throw new Error('Image has no usable URL.');
    const url = new URL(value.storageUrl);
    if (url.protocol !== 'https:' || url.username || url.password)
      throw new Error(
        'Images require an HTTPS URL without credentials.'
      );
    return { name: value.name, storageUrl: value.storageUrl };
  }
  async images(query: string): Promise<WorkshopImage[]> {
    const value = await this.call('workshop_image', {
      operation: 'find',
      query,
    });
    if (!Array.isArray(value))
      throw new Error('Invalid image asset response.');
    return value.map((image) => this.image(image));
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
