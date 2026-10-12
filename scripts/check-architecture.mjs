import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = join(root, 'src/app');
const errors = [];
const warnings = [];
const bem = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$/;
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}
for (const path of files(app)) {
  const name = relative(app, path).split(sep).join('/');
  const text = readFileSync(path, 'utf8');
  if (/\.spec\.ts$/.test(name)) errors.push(`${name}: move specs to testing/app.`);
  if (name.includes('/') && !name.startsWith('features/')) errors.push(`${name}: group runtime features under features/<feature>.`);
  if (!name.endsWith('.ts')) continue;
  if (/templateUrl\s*:|styleUrls?\s*:/.test(text)) errors.push(`${name}: component HTML/SCSS must be inline.`);
  if (/\$any\s*\(|\bas\s+any\b|:\s*any\b/.test(text)) errors.push(`${name}: remove unsafe any casts/types.`);
  if (/\bHttpClient\b/.test(text) && !name.includes('/api/')) errors.push(`${name}: HttpClient belongs in api/.`);
  for (const match of text.matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const source = match[1];
    if (source.includes('testing/')) errors.push(`${name}: runtime must not import tests.`);
    if (source.startsWith('.')) {
      const target = relative(app, resolve(dirname(path), source)).split(sep).join('/');
      if (target.includes('/state/') && /@Component\s*\(/.test(text)) {
        errors.push(`${name}: components consume scoped view models, not singleton state directly.`);
      }
      if (target.includes('/api/') && !name.includes('/state/') && !name.includes('/api/')) {
        errors.push(`${name}: only state/ may consume the feature HTTP client.`);
      }
    }
  }
  if (name.includes('/api/') && /\bsignal\s*\(|\b(?:BehaviorSubject|ReplaySubject)\b/.test(text)) {
    errors.push(`${name}: API clients must not own singleton state.`);
  }
  if (name.includes('/state/') && /from ['"]@angular\/(?:router|forms|material)/.test(text)) {
    errors.push(`${name}: shared state must not depend on forms, routing or Material UI.`);
  }
  if (/@Component\s*\(/.test(text)) {
    if (!/changeDetection:\s*ChangeDetectionStrategy\.OnPush/.test(text)) {
      errors.push(`${name}: use OnPush change detection for reactive views.`);
    }
    for (const match of text.matchAll(/\bclass="([^"]+)"|\[class\.([^\]]+)\]/g)) {
      for (const className of (match[1] ?? match[2]).split(/\s+/)) {
        if (!bem.test(className)) errors.push(`${name}: '${className}' is not a BEM class name.`);
      }
    }
    const lines = text.trimEnd().split('\n').length;
    if (lines > 230) warnings.push(`${name}: ${lines} lines; review responsibilities or document a cohesive exception.`);
  }
}
for (const message of warnings) console.warn(`Review: ${message}`);
for (const message of errors) console.error(`Error: ${message}`);
if (errors.length) process.exitCode = 1;
else console.log('Architecture checks passed: feature folders, external tests, API/state boundaries, inline views, BEM and typed code.');
