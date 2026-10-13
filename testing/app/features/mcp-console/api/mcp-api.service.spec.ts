import { TestBed } from '@angular/core/testing';
import {
  McpApiService,
  endpointUrl,
} from '../../../../../src/app/features/mcp-console/api/mcp-api.service';
import { mcpCatalogContract } from '@tmdjr/service-mcp-gateway-contracts';

describe('McpApiService protocol boundary', () => {
  it('rejects insecure or credential-bearing endpoints before network access', () => {
    for (const url of [
      'http://example.com/mcp',
      'https://user:pass@example.com/mcp',
      'https://example.com/mcp?token=secret',
      'https://example.com/mcp#fragment',
    ]) {
      expect(() => endpointUrl(url)).toThrow();
    }
    expect(endpointUrl('http://127.0.0.1:3011/mcp').pathname).toBe(
      '/mcp'
    );
  });
  it('retains an actionable unauthorized failure from the real SDK', async () => {
    spyOn(window, 'fetch').and.resolveTo(
      new Response('', { status: 401 })
    );
    await expectAsync(
      TestBed.inject(McpApiService).open({
        endpoint: '/mcp',
        token: 'expired',
      })
    ).toBeRejectedWithError(/401|Unauthorized/i);
  });
  it('uses modern discovery, bearer headers, omitted cookies and the published arguments', async () => {
    const methods: string[] = [];
    const requests: RequestInit[] = [];
    const fetchSpy = spyOn(window, 'fetch').and.callFake(
      async (_input, init) => {
        requests.push(init!);
        const body = JSON.parse(init!.body as string) as {
          id: string;
          method: string;
          params?: unknown;
        };
        methods.push(body.method);
        let result: unknown;
        if (body.method === 'server/discover')
          result = {
            supportedVersions: ['2026-07-28'],
            capabilities: { tools: {} },
            _meta: {
              'io.modelcontextprotocol/serverInfo': {
                name: 'Test catalog',
                version: '1.0',
              },
            },
          };
        else if (body.method === 'tools/list')
          result = {
            resultType: 'complete',
            ttlMs: 0,
            cacheScope: 'private',
            tools: mcpCatalogContract.tools,
          };
        else if (body.method === 'tools/call') {
          expect(body.params).toEqual(
            jasmine.objectContaining({
              name: 'list_workshops',
              arguments: { sectionId: 'angular' },
            })
          );
          result = {
            resultType: 'complete',
            content: [{ type: 'text', text: '{"workshops":[]}' }],
            structuredContent: { workshops: [] },
          };
        } else throw new Error(`Unexpected method: ${body.method}`);
        return new Response(
          JSON.stringify({ jsonrpc: '2.0', id: body.id, result }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
    );
    const connection = await TestBed.inject(McpApiService).open({
      endpoint: 'http://localhost:3011/mcp',
      token: 'test-token',
    });
    expect(connection.server).toBe('Test catalog · 1.0');
    expect(connection.tools.length).toBe(3);
    await connection.call('list_workshops', { sectionId: 'angular' });
    await connection.close();
    expect(methods).toEqual([
      'server/discover',
      'tools/list',
      'tools/call',
    ]);
    expect(fetchSpy).toHaveBeenCalledTimes(3);
    for (const request of requests) {
      expect(new Headers(request.headers).get('Authorization')).toBe(
        'Bearer test-token'
      );
      expect(request.credentials).toBe('omit');
      expect(request.redirect).toBe('error');
    }
  });
});
