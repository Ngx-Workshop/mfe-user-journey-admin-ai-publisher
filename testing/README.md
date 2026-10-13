# Console tests

Run `npm test -- --watch=false --browsers=ChromeHeadless`.
Tests under app mirror src/app. They use synthetic fetch/API doubles and test the
SDK protocol boundary, singleton lifecycle, scoped input mapping, and rendered
catalog output. No live credentials, browser storage or domain data are used.
See ../docs/development.md for integration prerequisites.
