import { OAuthApiService, oauth, pkceChallenge } from '../../../../../src/app/features/mcp-console/api/oauth-api.service';

describe('OAuth PKCE redemption', () => {
  const state = 's'.repeat(43), verifier = 'v'.repeat(43);
  let api: OAuthApiService, request: jasmine.Spy;
  const callback = () => new URL(`${oauth.callback}?code=private-code&state=${state}&iss=${encodeURIComponent(oauth.issuer)}`);
  beforeEach(() => {
    api = new OAuthApiService();
    spyOn(history, 'replaceState');
    request = spyOn(window, 'fetch').and.resolveTo(new Response(JSON.stringify({ access_token: 'memory-only', token_type: 'Bearer', expires_in: 600, scope: 'catalog:read' })));
    sessionStorage.setItem('ngx-ai-publisher-pkce', JSON.stringify({ state, verifier, created: Date.now() }));
  });
  afterEach(() => sessionStorage.removeItem('ngx-ai-publisher-pkce'));
  it('matches the RFC 7636 S256 example', async () => {
    expect(await pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
  });
  it('redeems exact resource and verifier without cookies and consumes the transaction', async () => {
    const access = await api.complete(callback());
    expect(access?.token).toBe('memory-only');
    expect(sessionStorage.getItem('ngx-ai-publisher-pkce')).toBeNull();
    expect(history.replaceState).toHaveBeenCalledBefore(request);
    const init = request.calls.mostRecent().args[1] as RequestInit;
    const body = init.body as URLSearchParams;
    expect(body.get('resource')).toBe(oauth.resource); expect(body.get('code_verifier')).toBe(verifier);
    expect(body.get('redirect_uri')).toBe(oauth.callback); expect(init.credentials).toBe('omit'); expect(init.redirect).toBe('error');
    await expectAsync(api.complete(callback())).toBeRejected(); expect(request).toHaveBeenCalledTimes(1);
  });
  for (const reason of ['state', 'iss', 'duplicate', 'callback', 'expiry', 'denied']) {
    it(`rejects ${reason} before redemption`, async () => {
      const url = callback();
      if (reason === 'state' || reason === 'iss') url.searchParams.set(reason, 'attacker');
      if (reason === 'duplicate') url.searchParams.append('code', 'another');
      if (reason === 'callback') url.pathname = '/other';
      if (reason === 'expiry') sessionStorage.setItem('ngx-ai-publisher-pkce', JSON.stringify({ state, verifier, created: Date.now() - 600001 }));
      if (reason === 'denied') { url.searchParams.delete('code'); url.searchParams.set('error', 'access_denied'); }
      await expectAsync(api.complete(url)).toBeRejected(); expect(request).not.toHaveBeenCalled();
      expect(sessionStorage.getItem('ngx-ai-publisher-pkce')).toBeNull(); expect(history.replaceState).toHaveBeenCalled();
    });
  }
  it('rejects wrong scope or unbounded token lifetime', async () => {
    request.and.resolveTo(new Response(JSON.stringify({ access_token: 'secret', token_type: 'Bearer', expires_in: 601, scope: 'catalog:read' })));
    await expectAsync(api.complete(callback())).toBeRejected();
  });
});
