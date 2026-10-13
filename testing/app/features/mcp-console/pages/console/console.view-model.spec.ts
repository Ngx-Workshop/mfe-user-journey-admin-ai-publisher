import { TestBed } from '@angular/core/testing';
import { ConsoleViewModel } from '../../../../../../src/app/features/mcp-console/pages/console/console.view-model';
import { McpApiService } from '../../../../../../src/app/features/mcp-console/api/mcp-api.service';
import { McpConsoleStore } from '../../../../../../src/app/features/mcp-console/state/mcp-console.store';
import { mcpCatalogContract } from '@tmdjr/service-mcp-gateway-contracts';

describe('ConsoleViewModel', () => {
  let vm: ConsoleViewModel;
  let run: jasmine.Spy;
  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        ConsoleViewModel,
        {
          provide: McpApiService,
          useValue: {
            open: async () => ({
              server: 'Catalog',
              tools: mcpCatalogContract.tools,
              call: async () => ({
                content: [],
                structuredContent: { workshops: [] },
              }),
              close: async () => undefined,
            }),
          },
        },
      ],
    });
    vm = TestBed.inject(ConsoleViewModel);
    await TestBed.inject(McpConsoleStore).connect({
      endpoint: '/mcp',
      token: '',
    });
    run = spyOn(
      TestBed.inject(McpConsoleStore),
      'run'
    ).and.resolveTo();
  });
  it('validates before sending and trims only applicable arguments', () => {
    vm.run();
    expect(run).not.toHaveBeenCalled();
    expect(vm.validation()).toContain('section ID');
    vm.toolForm.patchValue({
      sectionId: ' angular ',
      workshopId: 'unused',
    });
    vm.run();
    expect(run).toHaveBeenCalledWith('list_workshops', {
      sectionId: 'angular',
    });
  });
  it('requires ObjectIds and omits a blank optional version', () => {
    vm.select('get_coding_lab');
    vm.toolForm.patchValue({ labId: 'bad' });
    vm.run();
    expect(run).not.toHaveBeenCalled();
    vm.toolForm.patchValue({
      labId: '0123456789abcdef01234567',
      versionId: ' ',
    });
    vm.run();
    expect(run).toHaveBeenCalledWith('get_coding_lab', {
      labId: '0123456789abcdef01234567',
    });
  });
  it('prefills drilldown inputs and clears credentials on disconnect', () => {
    vm.inspectWorkshop('angular', 'intro');
    expect(vm.selected()).toBe('get_workshop');
    expect(vm.toolForm.controls.workshopId.value).toBe('intro');
    vm.inspectLab('0123456789abcdef01234567');
    expect(vm.selected()).toBe('get_coding_lab');
    vm.disconnect();
    expect(vm.status()).toBe('disconnected');
  });
});
