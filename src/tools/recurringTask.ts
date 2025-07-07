import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerRecurringTaskTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_recurring_tasks',
      description: 'List all recurring tasks, optionally filtered by workspace',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Filter by workspace ID' },
        },
        required: [],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspaceId: z.string().optional(),
        });

        const validated = schema.parse(args);
        const recurringTasks = await client.listRecurringTasks(validated.workspaceId);

        return {
          recurringTasks,
          count: recurringTasks.length,
        };
      },
    },
    {
      name: 'motion_create_recurring_task',
      description: 'Create a new recurring task',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Recurring task name' },
          workspaceId: { type: 'string', description: 'Workspace ID' },
          frequency: {
            type: 'string',
            enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
            description: 'Recurrence frequency',
          },
          recurrenceRule: { type: 'string', description: 'Custom recurrence rule (optional)' },
          duration: {
            type: ['string', 'number'],
            description: 'Duration: "NONE", "REMINDER", or minutes',
          },
          description: { type: 'string', description: 'Task description' },
          projectId: { type: 'string', description: 'Project ID to associate with' },
          assigneeId: { type: 'string', description: 'User ID to assign to' },
        },
        required: ['name', 'workspaceId', 'frequency'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          workspaceId: z.string().min(1),
          frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
          recurrenceRule: z.string().optional(),
          duration: z.union([z.string(), z.number()]).optional(),
          description: z.string().optional(),
          projectId: z.string().optional(),
          assigneeId: z.string().optional(),
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
      name: 'motion_update_recurring_task',
      description: 'Update an existing recurring task',
      inputSchema: {
        type: 'object',
        properties: {
          recurringTaskId: { type: 'string', description: 'Recurring task ID to update' },
          name: { type: 'string', description: 'New name' },
          frequency: {
            type: 'string',
            enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'],
            description: 'New frequency',
          },
          recurrenceRule: { type: 'string', description: 'New recurrence rule' },
          duration: {
            type: ['string', 'number'],
            description: 'New duration',
          },
          description: { type: 'string', description: 'New description' },
          projectId: { type: 'string', description: 'New project ID' },
          assigneeId: { type: 'string', description: 'New assignee ID' },
        },
        required: ['recurringTaskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          recurringTaskId: z.string().min(1),
          name: z.string().optional(),
          frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']).optional(),
          recurrenceRule: z.string().optional(),
          duration: z.union([z.string(), z.number()]).optional(),
          description: z.string().optional(),
          projectId: z.string().optional(),
          assigneeId: z.string().optional(),
        });

        const { recurringTaskId, ...updateParams } = schema.parse(args);

        // Filter out undefined values
        const filteredParams: any = {};
        Object.keys(updateParams).forEach((key) => {
          if ((updateParams as any)[key] !== undefined) {
            filteredParams[key] = (updateParams as any)[key];
          }
        });

        return await client.updateRecurringTask(recurringTaskId, filteredParams);
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
