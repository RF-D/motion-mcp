# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is an MCP (Model Context Protocol) server for Motion (usemotion.com) that enables AI assistants to interact with Motion's API. The server implements 32 tools across 8 categories for comprehensive task, project, and calendar management.

## Key Commands

### Development
```bash
npm run dev          # Development mode with hot reload
npm run build        # Compile TypeScript to JavaScript
npm run start        # Run compiled version
```

### Code Quality (Run these before committing)
```bash
npm run typecheck    # Check TypeScript types
npm run lint         # Run ESLint
npm run format       # Format with Prettier
```

## Architecture

### Core Components

1. **API Client** (`src/api/client.ts`): 
   - Handles all Motion API interactions
   - Implements rate limiting (12 req/min for individual, 120 for team accounts)
   - Uses p-queue for request queuing
   - Provides comprehensive error handling

2. **Tool Modules** (`src/tools/`):
   - Each file implements a specific category of MCP tools
   - All tools follow consistent pattern: input validation → API call → response formatting
   - Tools use Zod schemas for runtime validation

3. **Type System** (`src/types/`):
   - `motion.ts`: Complete Motion API type definitions
   - `tool.ts`: MCP tool interface definitions
   - All API responses are strongly typed

### Key Patterns

1. **Tool Registration**: Tools are imported and registered in `src/index.ts` using a modular pattern. Each tool module exports an array of tool definitions.

2. **Error Handling**: The API client wraps all requests with try-catch and provides detailed error messages. Rate limit errors are handled specially.

3. **Environment Configuration**: Required env vars are validated at startup. The server won't start without a valid MOTION_API_KEY.

4. **Rate Limiting**: Implemented using p-queue with configurable limits based on account type.

## Motion API Integration

- Base URL: `https://api.usemotion.com/v1`
- Authentication: X-API-Key header
- Rate limits are strictly enforced by the p-queue implementation
- All datetime values use ISO 8601 format
- API documentation reference: `docs/MOTION_API_REFERENCE.md`

## Adding New Features

When adding new Motion API integrations:
1. Add types to `src/types/motion.ts`
2. Create new tool in appropriate file under `src/tools/`
3. Follow existing tool patterns for consistency
4. Register the tool in `src/index.ts`
5. Update README.md with the new tool documentation

## Testing Locally

1. Copy `.env.example` to `.env` and add your Motion API key
2. Run `npm run build && npm run dev`
3. The server will start on stdio for MCP communication
4. Use Claude Desktop or another MCP client to connect