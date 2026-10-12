# Seed example tests

Specs live outside production source. testing/app mirrors src/app; fixtures live
under testing/fixtures. Runtime code must not import testing. Move matching specs
and update imports when feature folders change.

Run the full suite with `npm test -- --watch=false --browsers=ChromeHeadless`.
Run a focused suite with:

```sh
npm test -- --watch=false --browsers=ChromeHeadless \
  --include='../testing/app/features/example-documents/forms/example-form.service.spec.ts'
```

Karma discovery is relative to src: angular.json includes ../testing/**/*.spec.ts.
The test compiler includes testing/**/*.ts plus src/**/*.d.ts and compiles app
modules through imports. The production compiler excludes specs/testing.
HTTP doubles verify client mappings, shared state cancellation/retry, form
validation/update semantics, scoped editor commands and actual app rendering.
