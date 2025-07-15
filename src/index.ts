#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { getConfig } from './config.js';
import { MotionApiClient } from './api/client.js';
import { registerWorkspaceTools } from './tools/workspace.js';
import { registerTaskTools } from './tools/task.js';
import { registerProjectTools } from './tools/project.js';
import { registerUserTools } from './tools/user.js';
import { registerScheduleTools } from './tools/schedule.js';
import { registerCommentTools } from './tools/comment.js';
import { registerCustomFieldTools } from './tools/customField.js';
import { registerRecurringTaskTools } from './tools/recurringTask.js';
import { registerStatusTools } from './tools/status.js';

async function main() {
  const config = getConfig();
  const apiClient = new MotionApiClient(config);

  const server = new Server(
    {
      name: 'motion-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all tool handlers
  const tools = [
    ...registerWorkspaceTools(apiClient),
    ...registerTaskTools(apiClient),
    ...registerProjectTools(apiClient),
    ...registerUserTools(apiClient),
    ...registerScheduleTools(apiClient),
    ...registerCommentTools(apiClient),
    ...registerCustomFieldTools(apiClient),
    ...registerRecurringTaskTools(apiClient),
    ...registerStatusTools(apiClient),
  ];

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    };
  });

  // Handle tool execution
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const tool = tools.find((t) => t.name === request.params.name);

    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Tool ${request.params.name} not found`);
    }

    try {
      const result = await tool.handler(request.params.arguments || {});
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      if (error instanceof Error) {
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${error.message}`);
      }
      throw error;
    }
  });

  // Start the server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Motion MCP server started successfully');
}

main().catch((error) => {
  console.error('Fatal error starting Motion MCP server:', error);
  process.exit(1);
});
