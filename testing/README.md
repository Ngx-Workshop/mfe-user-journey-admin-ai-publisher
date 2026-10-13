# AI Publisher tests

Run npm test -- --watch=false --browsers=ChromeHeadless. testing/app mirrors src/app. HTTP/store doubles verify publisher requests, draft review/validation, receipt handling and application composition. MCP tests moved to the dedicated Gateway MFE. No live publishing/model calls run in this suite.
