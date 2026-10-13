import {
  computed,
  DestroyRef,
  inject,
  Injectable,
  signal,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { exhaustMap, from, Subject } from 'rxjs';
import { OAuthConnectionStore } from '../../state/oauth-connection.store';
import { McpConsoleStore } from '../../state/mcp-console.store';
import {
  toolChoices,
  type ToolInput,
  type ToolName,
} from '../../models/console.models';

@Injectable()
export class ConsoleViewModel {
  private readonly store = inject(McpConsoleStore);
  private readonly oauthStore = inject(OAuthConnectionStore);
  private readonly authorization = new AbortController();
  readonly signingIn = this.oauthStore.busy;
  readonly signInError = this.oauthStore.error;
  private readonly commands = new Subject<() => Promise<unknown>>();
  readonly status = this.store.status;
  readonly server = this.store.server;
  readonly tools = this.store.tools;
  readonly result = this.store.result;
  readonly error = this.store.error;
  readonly running = this.store.running;
  readonly selected = signal<ToolName>('list_workshops');
  readonly choices = toolChoices;
  readonly active = computed(() =>
    this.choices.find((tool) => tool.name === this.selected())!
  );
  readonly available = computed(() =>
    this.tools().some(
      (tool) =>
        tool.name === this.selected() &&
        tool.annotations?.readOnlyHint === true
    )
  );
  readonly toolForm = new FormGroup({
    sectionId: new FormControl('', { nonNullable: true }),
    workshopId: new FormControl('', { nonNullable: true }),
    labId: new FormControl('', { nonNullable: true }),
    versionId: new FormControl('', { nonNullable: true }),
  });
  readonly validation = signal('');

  constructor() {
    const destroyRef = inject(DestroyRef);
    this.commands
      .pipe(
        exhaustMap((command) => from(command())),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe();
    destroyRef.onDestroy(() => {
      this.authorization.abort();
      this.disconnect();
    });
    void this.completeSignIn();
  }

  async connect(): Promise<void> {
    if (this.status() !== 'disconnected') return;
    await this.oauthStore.begin();
  }

  private async completeSignIn(): Promise<void> {
    await this.oauthStore.complete(this.authorization.signal);
  }

  disconnect(): void {
    this.store.disconnect();
    this.validation.set('');
  }

  select(name: ToolName): void {
    if (this.running()) return;
    this.selected.set(name);
    this.validation.set('');
  }

  run(): void {
    if (!this.available() || this.running()) return;
    const value = this.toolForm.getRawValue();
    const name = this.selected();
    const sectionId = value.sectionId.trim();
    const workshopId = value.workshopId.trim();
    const labId = value.labId.trim();
    const versionId = value.versionId.trim();
    const objectId = /^[a-f0-9]{24}$/i;
    const identifier = (id: string) =>
      id.length > 0 && id.length <= 120;
    if (
      name !== 'get_coding_lab' &&
      (!identifier(sectionId) ||
        (name === 'get_workshop' && !identifier(workshopId)))
    ) {
      this.validation.set(
        'Enter a section ID and, when needed, a workshop ID. Each must contain 1–120 characters.'
      );
      return;
    }
    if (
      name === 'get_coding_lab' &&
      (!objectId.test(labId) ||
        (versionId !== '' && !objectId.test(versionId)))
    ) {
      this.validation.set(
        'Lab ID and optional version ID must be 24 hexadecimal characters.'
      );
      return;
    }
    const input: ToolInput =
      name === 'get_coding_lab'
        ? { labId, ...(versionId ? { versionId } : {}) }
        : name === 'get_workshop'
          ? { sectionId, workshopId }
          : { sectionId };
    this.validation.set('');
    this.commands.next(() => this.store.run(name, input));
  }

  inspectWorkshop(sectionId: string, workshopId: string): void {
    this.toolForm.patchValue({ sectionId, workshopId });
    this.select('get_workshop');
  }
  inspectLab(labId: string): void {
    this.toolForm.patchValue({ labId, versionId: '' });
    this.select('get_coding_lab');
  }
}
