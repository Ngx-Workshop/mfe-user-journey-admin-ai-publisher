import { inject, Injectable, signal } from '@angular/core';
import { McpApiService } from '../api/mcp-api.service';
import {
  CatalogDisplayError,
  type CatalogResult,
  type ConnectionSettings,
  type McpConnection,
  type ToolInput,
  type ToolName,
} from '../models/console.models';
import { catalogResult } from './catalog-result';

@Injectable({ providedIn: 'root' })
export class McpConsoleStore {
  private readonly api = inject(McpApiService);
  private connection?: McpConnection;
  private generation = 0;
  private expiresAt?: number;
  private expiryTimer?: ReturnType<typeof setTimeout>;
  private pendingConnection?: AbortController;
  private readonly statusState = signal<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');
  private readonly serverState = signal('');
  private readonly toolsState = signal<McpConnection['tools']>([]);
  private readonly resultState = signal<CatalogResult | null>(null);
  private readonly errorState = signal('');
  private readonly runningState = signal(false);
  readonly status = this.statusState.asReadonly();
  readonly server = this.serverState.asReadonly();
  readonly tools = this.toolsState.asReadonly();
  readonly result = this.resultState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly running = this.runningState.asReadonly();

  async connect(settings: ConnectionSettings): Promise<boolean> {
    this.disconnect();
    const generation = this.generation;
    this.expiresAt = settings.expiresAt;
    if (settings.expiresAt !== undefined) {
      const remaining = settings.expiresAt - Date.now();
      if (remaining <= 0) {
        this.expire();
        return false;
      }
      this.expiryTimer = setTimeout(() => this.expire(), remaining);
    }
    this.statusState.set('connecting');
    const controller = new AbortController();
    this.pendingConnection = controller;
    try {
      const connection = await this.api.open(
        settings,
        controller.signal
      );
      if (generation !== this.generation) {
        await connection.close();
        return false;
      }
      this.pendingConnection = undefined;
      this.connection = connection;
      this.serverState.set(connection.server);
      this.toolsState.set(connection.tools);
      this.statusState.set('connected');
      return true;
    } catch (error) {
      if (generation === this.generation) {
        this.pendingConnection = undefined;
        this.statusState.set('disconnected');
        this.errorState.set(this.message(error));
      }
      return false;
    }
  }

  async run(name: ToolName, input: ToolInput): Promise<void> {
    if (
      this.expiresAt !== undefined &&
      Date.now() >= this.expiresAt
    ) {
      this.expire();
      return;
    }
    const connection = this.connection;
    if (!connection || this.running()) return;
    if (
      !this.tools().some(
        (tool) =>
          tool.name === name &&
          tool.annotations?.readOnlyHint === true
      )
    ) {
      this.errorState.set(
        'This read-only tool is not available on the connected server.'
      );
      return;
    }
    const generation = this.generation;
    this.runningState.set(true);
    this.resultState.set(null);
    this.errorState.set('');
    try {
      const response = await connection.call(name, input);
      if (generation === this.generation)
        this.resultState.set(catalogResult(name, response));
    } catch (error) {
      if (generation === this.generation) {
        if (
          error instanceof Error &&
          /401|unauthoriz/i.test(error.message)
        )
          this.expire();
        else this.errorState.set(this.message(error));
      }
    } finally {
      if (generation === this.generation)
        this.runningState.set(false);
    }
  }

  disconnect(): void {
    this.generation++;
    this.expiresAt = undefined;
    clearTimeout(this.expiryTimer);
    this.expiryTimer = undefined;
    this.pendingConnection?.abort();
    this.pendingConnection = undefined;
    const connection = this.connection;
    this.connection = undefined;
    void connection?.close().catch(() => undefined);
    this.statusState.set('disconnected');
    this.serverState.set('');
    this.toolsState.set([]);
    this.resultState.set(null);
    this.errorState.set('');
    this.runningState.set(false);
  }

  private expire(): void {
    this.disconnect();
    this.errorState.set(
      'Your connection expired or was revoked. Connect Ngx Workshop again.'
    );
  }

  private message(error: unknown): string {
    if (error instanceof CatalogDisplayError) return error.message;
    if (error instanceof Error) {
      if (/401|unauthoriz/i.test(error.message))
        return 'Your connection expired or was revoked. Connect Ngx Workshop again.';
      if (/403|forbidden|insufficient.scope/i.test(error.message))
        return 'Access denied. Check catalog:read scope and the gateway’s allowed browser origins.';
      if (/fetch|network/i.test(error.message))
        return 'Cannot reach the gateway. Check its URL, local proxy or browser CORS configuration.';
      if (/timeout|timed out/i.test(error.message))
        return 'The gateway took too long to respond. Try again.';
    }
    // Do not echo transport details: they may contain connection credentials.
    return 'The request failed. Check the gateway and try again.';
  }
}
