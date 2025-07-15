# Motion MCP Tests

Simple integration tests for the Motion MCP server tools. These tests use real API calls to the Motion API.

## Setup

1. Ensure you have a valid `MOTION_API_KEY` in your `.env` file
2. Create a workspace named "Test" in your Motion account
3. Run tests with `npm test`

## Test Structure

- **setup.ts** - Test configuration and utilities
- **utils.ts** - Helper functions for testing tools
- **tools/** - Test files for each tool category
  - workspace.test.ts - Workspace tools
  - user.test.ts - User tools  
  - task.test.ts - Task tools
  - project.test.ts - Project tools
  - schedule-status.test.ts - Schedule and status tools

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- test/tools/task.test.ts

# Watch mode
npm run test:watch
```

## Important Notes

- Tests use real API calls (no mocks)
- Rate limiting is enforced (12 requests/minute for individual accounts)
- Tests clean up after themselves when possible
- All test data uses unique prefixes to avoid conflicts