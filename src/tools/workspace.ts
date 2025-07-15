import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerWorkspaceTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_workspaces',
      description: 'List all workspaces accessible to the authenticated user. Supports pagination and filtering by IDs.',
      inputSchema: {
        type: 'object',
        properties: {
          cursor: { type: 'string', description: 'Pagination cursor from previous response' },
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of workspace IDs to get expanded details',
          },
        },
        required: [],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          cursor: z.string().optional(),
          ids: z.array(z.string()).optional(),
        });

        const validated = schema.parse(args);
        const response = await client.listWorkspaces(validated);
        
        return {
          workspaces: response.workspaces,
          meta: response.meta,
          count: response.workspaces?.length || 0,
        };
      },
    },
    {
      name: 'motion_get_workspace',
      description: 'Get details of a specific workspace by ID',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: {
            type: 'string',
            description: 'The ID of the workspace to retrieve',
          },
        },
        required: ['workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspaceId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.getWorkspace(validated.workspaceId);
      },
    },
  ];
}
