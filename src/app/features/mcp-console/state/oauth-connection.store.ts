import { inject, Injectable, signal } from '@angular/core';
import {
  OAuthApiService,
  OAuthConnectionError,
  oauth,
} from '../api/oauth-api.service';
import { McpConsoleStore } from './mcp-console.store';

@Injectable({ providedIn: 'root' })
export class OAuthConnectionStore {
  private readonly api = inject(OAuthApiService);
  private readonly catalog = inject(McpConsoleStore);
  private readonly busyState = signal(false);
  private readonly errorState = signal('');
  readonly busy = this.busyState.asReadonly();
  readonly error = this.errorState.asReadonly();

  async begin(): Promise<void> {
    if (this.busy()) return;
    this.busyState.set(true);
    this.errorState.set('');
    try {
      await this.api.begin();
    } catch {
      this.errorState.set(
        'Sign-in could not start. Enable tab storage and connect from the production console.'
      );
      this.busyState.set(false);
    }
  }

  async complete(signal: AbortSignal): Promise<void> {
    if (this.busy()) return;
    this.busyState.set(true);
    this.errorState.set('');
    try {
      const access = await this.api.complete(
        new URL(window.location.href),
        signal
      );
      if (access && !signal.aborted)
        await this.catalog.connect({
          endpoint: oauth.resource,
          token: access.token,
          expiresAt: access.expiresAt,
        });
    } catch (error) {
      if (!signal.aborted)
        this.errorState.set(
          error instanceof OAuthConnectionError
            ? error.message
            : 'Sign-in could not complete. Connect again.'
        );
    } finally {
      this.busyState.set(false);
    }
  }
}
