import { TestBed } from '@angular/core/testing';
import { McpApiService } from '../../../../../src/app/features/mcp-console/api/mcp-api.service';
import { McpConsoleStore } from '../../../../../src/app/features/mcp-console/state/mcp-console.store';
import type { McpConnection } from '../../../../../src/app/features/mcp-console/models/console.models';
import { mcpCatalogContract } from '@tmdjr/service-mcp-gateway-contracts';
import type { CallToolResult } from '@modelcontextprotocol/client';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
describe('McpConsoleStore', () => {
  let api: jasmine.SpyObj<McpApiService>;
  let store: McpConsoleStore;
  let connection: McpConnection;
  beforeEach(() => {
    api = jasmine.createSpyObj('McpApiService', ['open']);
    connection = {
      server: 'Catalog · 1',
      tools: mcpCatalogContract.tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        annotations: { ...tool.annotations },
        inputSchema: { type: 'object' as const },
      })),
      call: jasmine
        .createSpy('call')
        .and.resolveTo({
          content: [],
          structuredContent: { workshops: [] },
        }),
      close: jasmine.createSpy('close').and.resolveTo(),
    };
    api.open.and.resolveTo(connection);
    TestBed.configureTestingModule({
      providers: [{ provide: McpApiService, useValue: api }],
    });
    store = TestBed.inject(McpConsoleStore);
  });
  afterEach(() => store.disconnect());
  it('discovers identity and accepts a validated empty list', async () => {
    expect(
      await store.connect({ endpoint: '/mcp', token: '' })
    ).toBeTrue();
    expect(store.server()).toBe('Catalog · 1');
    expect(store.tools().length).toBe(3);
    await store.run('list_workshops', { sectionId: 'angular' });
    expect(store.result()?.data).toEqual({ workshops: [] });
    expect(store.running()).toBeFalse();
  });
  it('does not resurrect a connection that completes after disconnect', async () => {
    const pending = deferred<McpConnection>();
    api.open.and.returnValue(pending.promise);
    const command = store.connect({
      endpoint: '/mcp',
      token: 'memory-only',
    });
    const signal = api.open.calls.mostRecent().args[1]!;
    store.disconnect();
    expect(signal.aborted).toBeTrue();
    pending.resolve(connection);
    expect(await command).toBeFalse();
    expect(connection.close).toHaveBeenCalled();
    expect(store.status()).toBe('disconnected');
    expect(store.tools()).toEqual([]);
  });
  it('suppresses duplicate requests and late results after disconnect', async () => {
    await store.connect({ endpoint: '/mcp', token: '' });
    const pending = deferred<CallToolResult>();
    (connection.call as jasmine.Spy).and.returnValue(pending.promise);
    const command = store.run('list_workshops', {
      sectionId: 'angular',
    });
    await store.run('list_workshops', { sectionId: 'angular' });
    expect(connection.call).toHaveBeenCalledTimes(1);
    store.disconnect();
    pending.resolve({
      content: [],
      structuredContent: { workshops: [] },
    });
    await command;
    expect(store.result()).toBeNull();
    expect(store.running()).toBeFalse();
  });
  it('exposes tool failures and rejects malformed output; retry recovers', async () => {
    await store.connect({ endpoint: '/mcp', token: '' });
    (connection.call as jasmine.Spy).and.resolveTo({
      isError: true,
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: {
              code: 'NOT_FOUND',
              message: 'Workshop not found.',
            },
          }),
        },
      ],
    });
    await store.run('get_workshop', {
      sectionId: 'a',
      workshopId: 'b',
    });
    expect(store.error()).toBe('Workshop not found.');
    (connection.call as jasmine.Spy).and.resolveTo({
      content: [],
      structuredContent: { workshops: [{ id: 1 }] },
    });
    await store.run('list_workshops', { sectionId: 'a' });
    expect(store.error()).toContain('invalid catalog response');
    expect(store.result()).toBeNull();
    (connection.call as jasmine.Spy).and.resolveTo({
      content: [],
      structuredContent: { workshops: [] },
    });
    await store.run('list_workshops', { sectionId: 'a' });
    expect(store.error()).toBe('');
  });
  it('blocks tools missing a read-only annotation', async () => {
    connection.tools = [
      { name: 'get_workshop', inputSchema: { type: 'object' } },
    ];
    await store.connect({ endpoint: '/mcp', token: '' });
    await store.run('get_workshop', {
      sectionId: 'a',
      workshopId: 'b',
    });
    expect(connection.call).not.toHaveBeenCalled();
    expect(store.error()).toContain('not available');
  });
  it('maps authorization failures without echoing transport secrets', async () => {
    api.open.and.rejectWith(
      new Error('401 Unauthorized private-token')
    );
    expect(
      await store.connect({
        endpoint: '/mcp',
        token: 'private-token',
      })
    ).toBeFalse();
    expect(store.error()).toContain('Connect Ngx Workshop again');
    expect(store.error()).not.toContain('private-token');
  });
  it('closes expired connections and rejects late results', async () => {
    jasmine.clock().install();
    jasmine.clock().mockDate(new Date('2026-10-12T12:00:00Z'));
    try {
      await store.connect({
        endpoint: '/mcp',
        token: 'memory',
        expiresAt: Date.now() + 1000,
      });
      const pending = deferred<CallToolResult>();
      (connection.call as jasmine.Spy).and.returnValue(
        pending.promise
      );
      const run = store.run('list_workshops', {
        sectionId: 'angular',
      });
      jasmine.clock().tick(1001);
      expect(store.status()).toBe('disconnected');
      expect(connection.close).toHaveBeenCalled();
      pending.resolve({
        content: [],
        structuredContent: { workshops: [] },
      });
      await run;
      expect(store.result()).toBeNull();
      expect(store.error()).toContain('expired');
    } finally {
      jasmine.clock().uninstall();
    }
  });
  it('closes a revoked bearer connection immediately', async () => {
    await store.connect({ endpoint: '/mcp', token: 'memory' });
    (connection.call as jasmine.Spy).and.rejectWith(
      new Error('401 Unauthorized')
    );
    await store.run('list_workshops', { sectionId: 'angular' });
    expect(store.status()).toBe('disconnected');
    expect(connection.close).toHaveBeenCalled();
    expect(store.error()).toContain('revoked');
  });
});
