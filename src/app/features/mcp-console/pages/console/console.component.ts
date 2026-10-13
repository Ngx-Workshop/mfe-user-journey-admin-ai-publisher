import { PublishingComponent } from '../../../workshop-publishing/pages/publishing.component';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ConsoleViewModel } from './console.view-model';
import { ResultComponent } from '../../components/result/result.component';

@Component({
  selector: 'ngx-mcp-console',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatProgressBarModule, ResultComponent, PublishingComponent],
  providers: [ConsoleViewModel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="console">
      <header class="console__header">
        <div><p class="console__eyebrow">NGX WORKSHOP / AI PUBLISHER</p><h1>Create and publish workshops.</h1>
          <p class="console__intro">Create learning materials with your Publishing Agent and explore the workshop catalog.</p></div>
        <span class="console__badge">AI workshop publisher</span>
      </header>
      <ngx-workshop-publishing />
      <section class="console__connection" aria-labelledby="connection-title">
        <div class="console__section-heading"><div><p class="console__eyebrow">01 / CONNECT</p><h2 id="connection-title">MCP gateway</h2></div>
          <span class="console__status" role="status">{{ vm.status() === 'connected' ? '● Connected' : vm.status() === 'connecting' ? '◌ Connecting…' : '○ Disconnected' }}</span></div>
        @if (vm.status() === 'disconnected') {
          <p class="console__note">Sign in with your Ngx Workshop account and approve access to the published catalog.</p>
          <button mat-flat-button [disabled]="vm.signingIn()" (click)="vm.connect()">{{ vm.signingIn() ? 'Completing sign-in…' : 'Connect Ngx Workshop' }}</button>
          <p class="console__note">Your connection expires automatically. Reconnect when prompted.</p>
        } @else {
          <div class="console__connected"><div><strong>{{ vm.server() || 'Discovering server capabilities…' }}</strong><p>{{ vm.tools().length }} tools discovered</p></div>
            <button mat-stroked-button (click)="vm.disconnect()">Disconnect</button></div>
        }
      </section>
      @if (vm.status() === 'connecting' || vm.running()) { <mat-progress-bar mode="indeterminate" aria-label="Waiting for MCP gateway" /> }
      @if (vm.signInError()) { <p class="console__error" role="alert">{{ vm.signInError() }}</p> }
      @if (vm.error()) { <p class="console__error" role="alert">{{ vm.error() }}</p> }
      <div class="console__workspace">
        <section class="console__tools" aria-labelledby="tools-title">
          <p class="console__eyebrow">02 / EXPLORE</p><h2 id="tools-title">Choose a tool</h2>
          <p class="console__note">Three ways to inspect published content.</p>
          <div class="console__tool-list">
            @for (tool of vm.choices; track tool.name) {
              <button class="console__tool" [class.console__tool--selected]="vm.selected() === tool.name" [attr.aria-pressed]="vm.selected() === tool.name"
                [disabled]="vm.running()" (click)="vm.select(tool.name)"><strong>{{ tool.title }}</strong><span>{{ tool.description }}</span><code>{{ tool.name }}</code></button>
            }
          </div>
          <form class="console__tool-form" [formGroup]="vm.toolForm" (ngSubmit)="vm.run()">
            <h3>{{ vm.active().title }}</h3>
            @if (vm.selected() !== 'get_coding_lab') {
              <mat-form-field appearance="outline"><mat-label>Section ID</mat-label><input matInput formControlName="sectionId" maxlength="120" required [readonly]="vm.running()" /><mat-hint>The catalog’s section identifier.</mat-hint></mat-form-field>
              @if (vm.selected() === 'get_workshop') { <mat-form-field appearance="outline"><mat-label>Workshop ID</mat-label><input matInput formControlName="workshopId" maxlength="120" required [readonly]="vm.running()" /></mat-form-field> }
            } @else {
              <mat-form-field appearance="outline"><mat-label>Lab ID</mat-label><input matInput formControlName="labId" required [readonly]="vm.running()" /><mat-hint>24 hexadecimal characters.</mat-hint></mat-form-field>
              <mat-form-field appearance="outline"><mat-label>Version ID (optional)</mat-label><input matInput formControlName="versionId" [readonly]="vm.running()" /><mat-hint>Leave blank for the latest published version.</mat-hint></mat-form-field>
            }
            @if (vm.validation()) { <p class="console__error" role="alert">{{ vm.validation() }}</p> }
            <button mat-flat-button type="submit" [disabled]="!vm.available() || vm.running()">{{ vm.running() ? 'Running tool…' : 'Run tool →' }}</button>
            @if (vm.status() === 'connected' && !vm.available()) { <p class="console__note">This server did not advertise this tool as read-only.</p> }
          </form>
          @if (vm.status() === 'connected') {
            <details class="console__discovery"><summary>Discovered tools ({{ vm.tools().length }})</summary>
              @for (tool of vm.tools(); track tool.name) { <p><code>{{ tool.name }}</code><br />{{ tool.description }}</p> } @empty { <p>This server has no tools.</p> }
            </details>
          }
        </section>
        <section class="console__results" aria-labelledby="results-title" [attr.aria-busy]="vm.running()">
          <div class="console__section-heading"><div><p class="console__eyebrow">03 / INSPECT</p><h2 id="results-title">Response</h2></div><span class="console__format">STRUCTURED + JSON</span></div>
          <div role="status" class="console__announcement">{{ vm.running() ? 'Waiting for tool response.' : vm.result() ? 'Tool response received.' : '' }}</div>
          @if (vm.result(); as result) {
            <ngx-mcp-result [result]="result" (workshopSelected)="vm.inspectWorkshop($event.sectionId, $event.workshopId)" (labSelected)="vm.inspectLab($event)" />
          } @else {
            <div class="console__empty"><span class="console__empty-icon" aria-hidden="true">⌘</span><h3>{{ vm.running() ? 'Fetching catalog content…' : 'A window into your content' }}</h3>
              <p>{{ vm.status() !== 'connected' ? 'Connect your gateway to discover its tools. Then choose a tool and supply its identifiers.' : vm.error() ? 'Your request did not complete. Review the message and run the tool again.' : 'Run a tool to view workshop metadata, learning outlines or published coding labs here.' }}</p>
              <span class="console__empty-caption">Public content only · No content changes</span></div>
          }
          <p class="console__boundary">Catalog results describe published content. They do not determine learner access or eligibility.</p>
        </section>
      </div>
    </main>
  `,
  styles: [`
    :host { display: block; color: var(--mat-sys-on-surface, #202a34); background: var(--mat-sys-surface, #f8fafb); }
    .console { max-width: 1240px; margin: auto; padding: 2.5rem; }
    .console__header { display: flex; justify-content: space-between; align-items: center; gap: 1.5rem; margin-bottom: 2rem; }
    .console__eyebrow { font-size: .68rem; letter-spacing: .16em; font-weight: 700; color: var(--mat-sys-primary, #006879); margin: 0 0 .7rem; }
    h1 { font-size: clamp(1.8rem, 4vw, 2.8rem); letter-spacing: -.045em; margin: 0; }
    h2 { font-size: 1.15rem; margin: 0; } h3 { font-size: 1rem; }
    .console__intro { color: var(--mat-sys-on-surface-variant, #566573); line-height: 1.6; margin-bottom: 0; }
    .console__badge, .console__status { border-radius: 2rem; padding: .5rem .8rem; font-size: .75rem; white-space: nowrap; background: var(--mat-sys-secondary-container, #e2f0ef); color: var(--mat-sys-on-secondary-container, #24544f); }
    .console__connection, .console__tools, .console__results { border: 1px solid var(--mat-sys-outline-variant, #d8e0e5); border-radius: 1rem; padding: 1.5rem; background: var(--mat-sys-surface-container-lowest, #fff); }
    .console__section-heading { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
    .console__connection-form { display: grid; grid-template-columns: 1.1fr 1fr auto; gap: 1rem; align-items: start; }
    mat-form-field { width: 100%; }
    .console__note { font-size: .78rem; line-height: 1.6; color: var(--mat-sys-on-surface-variant, #566573); }
    .console__connected { display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    
    .console__workspace { display: grid; grid-template-columns: 350px minmax(0, 1fr); gap: 1.5rem; margin-top: 1.5rem; align-items: start; }
    .console__tool-list { display: grid; gap: .6rem; margin: 1.25rem 0; }
    .console__tool { text-align: left; border: 1px solid var(--mat-sys-outline-variant, #d8e0e5); border-radius: .7rem; padding: .95rem; background: transparent; color: inherit; font: inherit; cursor: pointer; }
    .console__tool strong, .console__tool span, .console__tool code { display: block; }
    .console__tool strong { font-size: .9rem; } .console__tool span { font-size: .78rem; line-height: 1.5; margin: .4rem 0; color: var(--mat-sys-on-surface-variant, #566573); }
    .console__tool code { font-size: .68rem; color: var(--mat-sys-primary, #006879); }
    .console__tool--selected { border-color: var(--mat-sys-primary, #006879); background: var(--mat-sys-primary-container, #def1f5); }
    .console__tool:focus-visible { outline: 2px solid var(--mat-sys-primary, #006879); outline-offset: 3px; }
    
    .console__tool-form { border-top: 1px solid var(--mat-sys-outline-variant, #d8e0e5); padding-top: .5rem; }
    .console__tool-form mat-form-field { margin-bottom: .6rem; } .console__tool-form button { width: 100%; }
    .console__empty { min-height: 330px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 1rem; }
    .console__empty-icon { font-size: 2rem; color: var(--mat-sys-primary, #006879); border: 1px solid var(--mat-sys-outline-variant, #d8e0e5); border-radius: 1rem; padding: .5rem 1rem; }
    .console__empty h3 { margin: 1.5rem 0 0; font-size: 1.1rem; } .console__empty p { max-width: 360px; font-size: .85rem; line-height: 1.75; color: var(--mat-sys-on-surface-variant, #566573); }
    
    .console__boundary { border-top: 1px solid var(--mat-sys-outline-variant, #d8e0e5); padding-top: 1rem; margin-top: 1.5rem; font-size: .72rem; line-height: 1.6; color: var(--mat-sys-on-surface-variant, #566573); }
    .console__error { border-left: 3px solid var(--mat-sys-error, #b3261e); padding: .85rem; font-size: .85rem; color: var(--mat-sys-error, #b3261e); background: var(--mat-sys-error-container, #ffdad6); }
    .console__discovery { margin-top: 1.2rem; font-size: .78rem; line-height: 1.6; } summary { cursor: pointer; }
    .console__announcement { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    @media (max-width: 1000px) { .console__connection-form { grid-template-columns: 1fr; } .console__connection-form button { justify-self: start; } }
    @media (max-width: 760px) { .console { padding: 1rem; } .console__header { align-items: start; flex-direction: column; } .console__workspace { grid-template-columns: 1fr; } .console__connection, .console__tools, .console__results { padding: 1rem; } .console__format { display: none; } }
  `],
})
export class ConsoleComponent { readonly vm = inject(ConsoleViewModel); }
