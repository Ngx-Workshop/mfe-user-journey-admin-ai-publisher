import { Injectable } from '@angular/core';

export const oauth = Object.freeze({
  issuer: 'https://auth.ngx-workshop.io',
  resource: 'https://mcp.ngx-workshop.io/mcp',
  clientId: 'ngx-workshop-ai-publisher-prod',
  callback: 'https://admin.ngx-workshop.io/ai-publisher/console',
});
const transactionKey = 'ngx-ai-publisher-pkce';
interface Transaction { state: string; verifier: string; created: number }
export interface OAuthAccess { token: string; expiresAt: number }
export class OAuthConnectionError extends Error {}
const encode = (value: Uint8Array) => btoa(String.fromCharCode(...value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export async function pkceChallenge(verifier: string): Promise<string> {
  return encode(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));
}

@Injectable({ providedIn: 'root' })
export class OAuthApiService {
  async begin(): Promise<void> {
    if (window.location.origin + window.location.pathname !== oauth.callback)
      throw new OAuthConnectionError('Connect from the production Ngx Workshop console.');
    const verifier = encode(crypto.getRandomValues(new Uint8Array(32)));
    const state = encode(crypto.getRandomValues(new Uint8Array(32)));
    const challenge = await pkceChallenge(verifier);
    sessionStorage.setItem(transactionKey, JSON.stringify({ state, verifier, created: Date.now() }));
    const url = new URL('/oauth/authorize', oauth.issuer);
    url.search = new URLSearchParams({ client_id: oauth.clientId, redirect_uri: oauth.callback,
      response_type: 'code', scope: 'catalog:read', resource: oauth.resource,
      code_challenge: challenge, code_challenge_method: 'S256', state }).toString();
    window.location.assign(url.href);
  }

  async complete(url: URL, signal?: AbortSignal): Promise<OAuthAccess | null> {
    if (!['code', 'error', 'state', 'iss'].some(key => url.searchParams.has(key))) return null;
    const raw = sessionStorage.getItem(transactionKey);
    sessionStorage.removeItem(transactionKey);
    // Strip credentials before any network request or rendering of an error.
    history.replaceState(history.state, '', url.pathname);
    let transaction: Transaction;
    try { transaction = JSON.parse(raw ?? 'null'); } catch { throw new OAuthConnectionError('Sign-in could not be verified. Connect again.'); }
    const params = url.searchParams;
    if (url.origin + url.pathname !== oauth.callback || url.hash ||
        !transaction || !/^[A-Za-z0-9_-]{43}$/.test(transaction.verifier) ||
        !/^[A-Za-z0-9_-]{43}$/.test(transaction.state) ||
        !Number.isFinite(transaction.created) || Date.now() - transaction.created < 0 ||
        Date.now() - transaction.created >= 600000 ||
        ['state', 'iss', ...(params.has('error') ? ['error'] : ['code'])].some(key => params.getAll(key).length !== 1) ||
        params.get('state') !== transaction.state || params.get('iss') !== oauth.issuer ||
        (params.has('code') && params.has('error'))) {
      throw new OAuthConnectionError('Sign-in could not be verified. Connect again.');
    }
    if (params.has('error')) throw new OAuthConnectionError('Sign-in was not approved. Connect again when ready.');
    const code = params.get('code');
    if (!code || code.length > 2048) throw new OAuthConnectionError('Sign-in could not be verified. Connect again.');
    const started = Date.now();
    const response = await fetch(new URL('/oauth/token', oauth.issuer), {
      method: 'POST', credentials: 'omit', redirect: 'error',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'authorization_code', client_id: oauth.clientId,
        redirect_uri: oauth.callback, code, code_verifier: transaction.verifier, resource: oauth.resource }),
      signal: AbortSignal.any([...(signal ? [signal] : []), AbortSignal.timeout(15000)]),
    });
    if (!response.ok) throw new OAuthConnectionError('Sign-in expired or could not complete. Connect again.');
    const value: unknown = await response.json();
    if (!value || typeof value !== 'object' || !('access_token' in value) ||
        typeof value.access_token !== 'string' || !value.access_token || value.access_token.length > 4096 ||
        !('token_type' in value) || typeof value.token_type !== 'string' || value.token_type.toLowerCase() !== 'bearer' ||
        !('expires_in' in value) || typeof value.expires_in !== 'number' || !Number.isInteger(value.expires_in) || value.expires_in <= 0 || value.expires_in > 600 ||
        !('scope' in value) || value.scope !== 'catalog:read' || 'refresh_token' in value)
      throw new OAuthConnectionError('The sign-in response was not accepted. Connect again.');
    const expiresAt = started + value.expires_in * 1000;
    if (expiresAt <= Date.now()) throw new OAuthConnectionError('Sign-in expired. Connect again.');
    return { token: value.access_token, expiresAt };
  }
}
