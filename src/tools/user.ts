import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerUserTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_get_current_user',
      description: 'Get information about the currently authenticated user',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        return await client.getCurrentUser();
      },
    },
    {
      name: 'motion_get_user',
      description: 'Get information about a specific user by ID',
      inputSchema: {
        type: 'object',
        properties: {
          userId: { type: 'string', description: 'The ID of the user to retrieve' },
        },
        required: ['userId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          userId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.getUser(validated.userId);
      },
    },
    {
      name: 'motion_list_users',
      description: 'List all users in a workspace',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID (required)' },
        },
        required: ['workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspaceId: z.string().min(1),
        });

        const validated = schema.parse(args);
        const users = await client.listUsers(validated.workspaceId);

        return {
          users,
          count: users.length,
        };
      },
    },
  ];
}
