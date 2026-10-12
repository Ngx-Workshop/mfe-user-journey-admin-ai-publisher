# Development and verification

Use Node 22 (CI baseline) and the committed lockfile. Private registry access may
be needed for npm ci; no sibling repository is required.

| Purpose | Command | Notes |
| --- | --- | --- |
| Install | `npm ci` | Uses existing dependency versions |
| Architecture | `npm run check:architecture` | Folder/API/state/inline/BEM/typed-code guard; >230 component lines requests review |
| Dev server | `npm start` | Port 4201; no backend supplied |
| Local bundle | `npm run dev:bundle` | Production watch + static CORS server; avoid competing servers |
| Build | `npm run build` | Production federation bundle |
| Isolated build | `npm run build -- --output-path dist/starter-verification` | Avoid overwriting an existing watcher output |
| Tests | `npm test -- --watch=false --browsers=ChromeHeadless` | HTTP doubles; set CHROME_BIN when needed |
| Types | `npx tsc --noEmit --noUnusedLocals --noUnusedParameters -p tsconfig.app.json` | Source types/unused symbols |

Specs are under testing/app, mirroring src/app; synthetic DTOs live in
testing/fixtures. See [testing guide](../testing/README.md) for focused commands.

## Verification and automation

Architecture checks complement compiler/tests and do not replace full lint or code
review. The lightweight script checks explicit source conventions, not every
semantic dependency. CI runs architecture checks, ChromeHeadless tests and a
production build. Deployment also runs the architecture guard before building.
Auth/gateway/host integration must be verified separately with test records.
No end-to-end framework or general-purpose lint dependency is introduced.

For UI changes inspect loading/empty/error/success states, keyboard form submission,
validation, dialog retry and narrow layouts. Static bundle serving does not proxy
/api; supply an explicit local gateway or synthetic fixtures. Host development
uses the platform's session-local remote override for localhost:4201/remoteEntry.js.
Standalone appConfig is not installed by host remote loading.

## Current limits and repaired starter defects

The obsolete title test, component API coupling, missing subscription teardown,
optimized Angular federation initialization, missing standalone Material theme,
double-slash detail URLs, unsafe casts, partial-address acceptance and false/blank
update omission are repaired. Save failures retain the editor and its values.
The generated DTO does not support removing a stored address; blank address edits
preserve it and the UI explains this. No auth policy, producer change, deployment
or live-data test is part of this starter upgrade.

See [001 handoff](../specs/001-mvvm-starter/handoff.md) for actual results and limits.
