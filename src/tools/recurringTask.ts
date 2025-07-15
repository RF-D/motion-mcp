import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerRecurringTaskTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_recurring_tasks',
      description: 'List all recurring tasks for a specific workspace. Supports pagination via cursor.',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID (required)' },
          cursor: { type: 'string', description: 'Pagination cursor from previous response' },
        },
        required: ['workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspaceId: z.string().min(1),
          cursor: z.string().optional(),
        });

        const validated = schema.parse(args);
        const response = await client.listRecurringTasks(validated);

        return {
          recurringTasks: response.recurringTasks,
          meta: response.meta,
          count: response.recurringTasks?.length || 0,
        };
      },
    },
    {
      name: 'motion_create_recurring_task',
      description: 'Create a new recurring task template that will generate tasks automatically',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Recurring task name' },
          workspaceId: { type: 'string', description: 'Workspace ID' },
          frequency: {
            type: 'string',
            description: 'Recurrence frequency (e.g., DAILY, WEEKLY_MONDAY, MONTHLY_1, MONTHLY_LAST)',
          },
          recurrenceRule: { type: 'string', description: 'Custom recurrence rule (optional)' },
          duration: {
            type: ['string', 'number'],
            description: 'Duration: "NONE", "REMINDER", or minutes',
          },
          description: { type: 'string', description: 'Task description' },
          projectId: { type: 'string', description: 'Project ID to associate with' },
          assigneeId: { type: 'string', description: 'User ID to assign to (required)' },
          deadlineType: {
            type: 'string',
            enum: ['HARD', 'SOFT'],
            description: 'Deadline type (default: SOFT)',
          },
          startingOn: { type: 'string', description: 'ISO 8601 date when to start generating tasks' },
          idealTime: { type: 'string', description: 'Preferred time of day (HH:mm format)' },
          schedule: { type: 'string', description: 'Schedule name (default: "Work Hours")' },
          priority: {
            type: 'string',
            enum: ['HIGH', 'MEDIUM'],
            description: 'Task priority (default: MEDIUM)',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Array of label names',
          },
        },
        required: ['name', 'workspaceId', 'frequency', 'assigneeId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          workspaceId: z.string().min(1),
          frequency: z.string().min(1),
          recurrenceRule: z.string().optional(),
          duration: z.union([z.string(), z.number()]).optional(),
          description: z.string().optional(),
          projectId: z.string().optional(),
          assigneeId: z.string().min(1),
          deadlineType: z.enum(['HARD', 'SOFT']).optional(),
          startingOn: z.string().optional(),
          idealTime: z.string().optional(),
          schedule: z.string().optional(),
          priority: z.enum(['HIGH', 'MEDIUM']).optional(),
          labels: z.array(z.string()).optional(),
        });

        const validated = schema.parse(args);
        return await client.createRecurringTask(validated);
      },
    },
    {
      name: 'motion_get_recurring_task',
      description: 'Get details of a specific recurring task',
      inputSchema: {
        type: 'object',
        properties: {
          recurringTaskId: { type: 'string', description: 'Recurring task ID to retrieve' },
        },
        required: ['recurringTaskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          recurringTaskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.getRecurringTask(validated.recurringTaskId);
      },
    },
    {
      name: 'motion_delete_recurring_task',
      description: 'Delete a recurring task permanently',
      inputSchema: {
        type: 'object',
        properties: {
          recurringTaskId: { type: 'string', description: 'Recurring task ID to delete' },
        },
        required: ['recurringTaskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          recurringTaskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.deleteRecurringTask(validated.recurringTaskId);
        return {
          success: true,
          message: `Recurring task ${validated.recurringTaskId} deleted successfully`,
        };
      },
    },
  ];
}
