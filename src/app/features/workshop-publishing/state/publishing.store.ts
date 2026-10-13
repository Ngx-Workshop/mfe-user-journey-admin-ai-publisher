import { inject, Injectable, signal } from '@angular/core';
import { PublishingApiService } from '../api/publishing-api.service';
import {
  PublisherTool,
  PublishingReceipt,
  WorkshopDraft,
} from '../models/publishing.models';
@Injectable({ providedIn: 'root' })
export class PublishingStore {
  private readonly api = inject(PublishingApiService);
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
    return this.execute(async () =>
      this.api.receipt(await this.api.call('publish_workshop', input))
    );
  }
  async receipt(
    requestId: string
  ): Promise<PublishingReceipt | undefined> {
    return this.execute(async () =>
      this.api.receipt(
        await this.api.call('get_publishing_run', { requestId })
      )
    );
  }
  async tool(name: PublisherTool, input: unknown): Promise<unknown> {
    return this.execute(() => this.api.call(name, input));
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
