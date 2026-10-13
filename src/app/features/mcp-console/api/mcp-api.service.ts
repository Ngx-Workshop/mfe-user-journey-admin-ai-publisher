import { Injectable } from '@angular/core';
import {
  Client,
  StreamableHTTPClientTransport,
} from '@modelcontextprotocol/client';
import {
  CatalogDisplayError,
  type ConnectionSettings,
  type McpConnection,
} from '../models/console.models';

export function endpointUrl(value: string): URL {
  let url: URL;
  try {
    url = new URL(value.trim(), window.location.origin);
  } catch {
    throw new CatalogDisplayError('Enter a valid MCP endpoint URL.');
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(
    url.hostname
  );
  if (
    (url.protocol !== 'https:' &&
      !(url.protocol === 'http:' && loopback)) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    throw new CatalogDisplayError(
      'Use HTTPS, or HTTP on localhost, without credentials, query parameters or fragments.'
    );
  }
  return url;
}

@Injectable({ providedIn: 'root' })
export class McpApiService {
  async open(
    settings: ConnectionSettings,
    signal?: AbortSignal
  ): Promise<McpConnection> {
    const url = endpointUrl(settings.endpoint);
    const client = new Client(
      { name: 'ngx-admin-ai-publisher', version: '0.0.1' },
      {
        versionNegotiation: { mode: { pin: '2026-07-28' } },
      }
    );
    const transport = new StreamableHTTPClientTransport(url, {
      requestInit: {
        headers: settings.token.trim()
          ? { Authorization: `Bearer ${settings.token.trim()}` }
          : {},
        credentials: 'omit',
        redirect: 'error',
      },
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          signal: AbortSignal.any([
            ...(init?.signal ? [init.signal] : []),
            ...(signal ? [signal] : []),
            AbortSignal.timeout(15000),
          ]),
        }),
    });
    try {
      await client.connect(transport, { timeout: 15000 });
      const { tools } = await client.listTools(
        {},
        { timeout: 15000 }
      );
      const identity = client.getServerVersion();
      return {
        server: identity
          ? `${identity.name} · ${identity.version}`
          : 'MCP gateway',
        tools,
        call: (name, input) =>
          client.callTool(
            { name, arguments: { ...input } },
            { timeout: 15000 }
          ),
        close: () => client.close(),
      };
    } catch (error) {
      await client.close().catch(() => undefined);
      throw error;
    }
  }
}
