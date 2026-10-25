const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { test } = require('node:test');

const builderRequire = createRequire(
  require.resolve('@angular-devkit/build-angular/package.json')
);
const ProvideSharedModule = builderRequire(
  'webpack/lib/sharing/ProvideSharedModule'
);
const { WebpackInnerModuleIterator } = builderRequire(
  'license-webpack-plugin/dist/WebpackInnerModuleIterator'
);

test('license extraction resolves webpack federation providers', () => {
  const resource = builderRequire.resolve('@angular/core');
  const provider = new ProvideSharedModule(
    'default',
    '@angular/core',
    '21.1.0',
    resource,
    false
  );
  const resources = [];
  new WebpackInnerModuleIterator(builderRequire.resolve).iterateModules(
    { resource: provider.identifier() },
    (module) => resources.push(module.resource)
  );

  assert.deepEqual(resources, [resource]);
});

test('the builder and federation config use the same webpack instance', () => {
  assert.equal(builderRequire('webpack'), require('webpack'));
});
