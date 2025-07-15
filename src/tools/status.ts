import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerStatusTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_statuses',
      description: 'List all available statuses, optionally filtered by workspace',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Filter by workspace ID (optional)' },
        },
        required: [],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspaceId: z.string().optional(),
        });

        const validated = schema.parse(args);
        const statuses = await client.listStatuses(validated.workspaceId);

        return {
          statuses,
          count: statuses.length,
        };
      },
    },
  ];
}
