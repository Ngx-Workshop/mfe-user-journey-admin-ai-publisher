import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { App } from '../../src/app/app';
import { McpApiService } from '../../src/app/features/mcp-console/api/mcp-api.service';
import { McpConsoleStore } from '../../src/app/features/mcp-console/state/mcp-console.store';
import { mcpCatalogContract } from '@tmdjr/service-mcp-gateway-contracts';

describe('MCP console journey', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [App], providers: [provideZonelessChangeDetection(), {
    provide: McpApiService, useValue: { open: async () => ({
      server: 'Test gateway · 1', tools: mcpCatalogContract.tools,
      call: async () => ({ content: [], structuredContent: { workshops: [] } }), close: async () => undefined,
    }) },
  }] }));
  it('renders a disconnected console without issuing automatic requests', async () => {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    await fixture.whenStable(); fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('h1')?.textContent).toContain('Create and publish workshops.');
    expect(el.textContent).toContain('Disconnected'); expect(el.textContent).toContain('AI workshop publisher');
    expect(el.querySelectorAll('.console__tool').length).toBe(3);
    expect(el.querySelector('input[type="password"]')).toBeNull();
    expect(el.textContent).toContain('Connect Ngx Workshop');
  });
  it('renders connected identity and an honest empty result', async () => {
    const fixture = TestBed.createComponent(App); fixture.detectChanges();
    const store = TestBed.inject(McpConsoleStore);
    await store.connect({ endpoint: '/mcp', token: '' }); await store.run('list_workshops', { sectionId: 'angular' });
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Test gateway · 1'); expect(el.textContent).toContain('No workshops in this section');
    expect(el.textContent).toContain('View response JSON');
  });
});
