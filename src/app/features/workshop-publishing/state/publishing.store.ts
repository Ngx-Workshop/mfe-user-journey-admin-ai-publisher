import { inject, Injectable, signal } from '@angular/core';
import { PublishingApiService } from '../api/publishing-api.service';
import {
  PublisherTool,
  PublishingReceipt,
  WorkshopDraft,
  PublishingModelCatalog,
  WorkshopImage,
} from '../models/publishing.models';
@Injectable({ providedIn: 'root' })
export class PublishingStore {
  private readonly api = inject(PublishingApiService);
  readonly catalog = signal<PublishingModelCatalog | null>(null);
  readonly history = signal<PublishingReceipt[]>([]);
  readonly unconfirmedRequests = signal<string[]>([]);
  readonly images = signal<WorkshopImage[]>([]);
  async loadModels(): Promise<void> {
    const catalog = await this.execute(() => this.api.models());
    if (catalog) this.catalog.set(catalog);
  }
  async loadHistory(): Promise<void> {
    const history = await this.execute(() => this.api.history());
    if (history) {
      this.history.set(history);
      this.unconfirmedRequests.update((ids) =>
        ids.filter(
          (id) => !history.some((run) => run.requestId === id)
        )
      );
    }
  }
  async loadImages(query: string): Promise<void> {
    const images = await this.execute(() => this.api.images(query));
    if (images) this.images.set(images);
  }
  async generateImage(
    prompt: string,
    name: string
  ): Promise<WorkshopImage | undefined> {
    return this.execute(async () =>
      this.api.image(
        await this.api.call('workshop_image', {
          operation: 'generate',
          prompt,
          name,
        })
      )
    );
  }
  readonly busy = signal(false);
  readonly error = signal('');
  readonly sections = signal<{ id: string; name: string }[]>([]);
  async loadSections(): Promise<void> {
    const sections = await this.execute(() => this.api.sections());
    if (sections) this.sections.set(sections);
  }
  async draft(
    name: 'generate_workshop_draft' | 'validate_workshop_draft',
    input: unknown
  ): Promise<WorkshopDraft | undefined> {
    return this.execute(async () =>
      this.api.draft(await this.api.call(name, input))
    );
  }
  async publish(input: {
    requestId: string;
    draft: WorkshopDraft;
  }): Promise<PublishingReceipt | undefined> {
    if (this.busy()) return undefined;
    this.unconfirmedRequests.update((ids) =>
      [
        input.requestId,
        ...ids.filter((id) => id !== input.requestId),
      ].slice(0, 100)
    );
    return this.execute(async () =>
      this.remember(
        this.api.receipt(
          await this.api.call('publish_workshop', input)
        )
      )
    );
  }
  async receipt(
    requestId: string
  ): Promise<PublishingReceipt | undefined> {
    return this.execute(async () =>
      this.remember(
        this.api.receipt(
          await this.api.call('get_publishing_run', { requestId })
        )
      )
    );
  }
  async tool(name: PublisherTool, input: unknown): Promise<unknown> {
    return this.execute(() => this.api.call(name, input));
  }
  private remember(receipt: PublishingReceipt): PublishingReceipt {
    this.unconfirmedRequests.update((ids) =>
      ids.filter((id) => id !== receipt.requestId)
    );
    this.history.update((rows) =>
      [
        receipt,
        ...rows.filter((row) => row.requestId !== receipt.requestId),
      ].slice(0, 100)
    );
    return receipt;
  }
  private async execute<T>(
    operation: () => Promise<T>
  ): Promise<T | undefined> {
    if (this.busy()) return undefined;
    this.busy.set(true);
    this.error.set('');
    try {
      return await operation();
    } catch (error) {
      const status =
        error && typeof error === 'object' && 'status' in error
          ? error.status
          : undefined;
      this.error.set(
        status === 401 || status === 403
          ? 'Sign in as an administrator to publish workshops.'
          : status === 404
            ? 'Workshop publishing is not enabled on this gateway.'
            : error instanceof Error && !('status' in error)
              ? error.message
              : 'The publishing request failed. Keep the request ID and check its receipt before retrying.'
      );
      return undefined;
    } finally {
      this.busy.set(false);
    }
  }
}
