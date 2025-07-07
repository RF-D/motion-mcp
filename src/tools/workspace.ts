import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerWorkspaceTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_workspaces',
      description: 'List all workspaces accessible to the authenticated user',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        const workspaces = await client.listWorkspaces();
        return {
          workspaces,
          count: workspaces.length,
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
