import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerTaskTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_tasks',
      description: 'List tasks with optional filters. Supports pagination via cursor.',
      inputSchema: {
        type: 'object',
        properties: {
          assigneeId: { type: 'string', description: 'Filter by assignee ID' },
          cursor: { type: 'string', description: 'Pagination cursor from previous response' },
          includeAllStatuses: { type: 'boolean', description: 'Include all task statuses' },
          label: { type: 'string', description: 'Filter by label name' },
          name: { type: 'string', description: 'Filter by task name (case-insensitive)' },
          projectId: { type: 'string', description: 'Filter by project ID' },
          status: {
            type: 'array',
            items: { type: 'string' },
            description: 'Filter by specific statuses',
          },
          workspaceId: { type: 'string', description: 'Filter by workspace ID' },
        },
        required: [],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          assigneeId: z.string().optional(),
          cursor: z.string().optional(),
          includeAllStatuses: z.boolean().optional(),
          label: z.string().optional(),
          name: z.string().optional(),
          projectId: z.string().optional(),
          status: z.array(z.string()).optional(),
          workspaceId: z.string().optional(),
        });

        const validated = schema.parse(args);
        const response = await client.listTasks(validated);

        return {
          tasks: response.tasks,
          meta: response.meta,
          count: response.tasks?.length || 0,
        };
      },
    },
    {
      name: 'motion_get_task',
      description: 'Get detailed information about a specific task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'The ID of the task to retrieve' },
        },
        required: ['taskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.getTask(validated.taskId);
      },
    },
    {
      name: 'motion_create_task',
      description: 'Create a new task in Motion',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Task title' },
          workspaceId: { type: 'string', description: 'Workspace ID' },
          dueDate: {
            type: 'string',
            description: 'ISO 8601 due date (required for scheduled tasks)',
          },
          duration: {
            type: ['string', 'number'],
            description: 'Duration: "NONE", "REMINDER", or minutes as integer',
          },
          status: { type: 'string', description: 'Task status (defaults to workspace default)' },
          autoScheduled: {
            type: ['object', 'null'],
            properties: {
              startDate: { type: 'string', description: 'ISO 8601 start date' },
              deadlineType: {
                type: 'string',
                enum: ['HARD', 'SOFT', 'NONE'],
                description: 'Deadline type',
              },
              schedule: {
                type: 'string',
                description: 'Schedule name (must be "Work Hours" for other users)',
              },
            },
            description: 'Auto-scheduling configuration (null to disable)',
          },
          projectId: { type: 'string', description: 'Project ID to associate with' },
          description: {
            type: 'string',
            description: 'Task description (GitHub Flavored Markdown)',
          },
          priority: {
            type: 'string',
            enum: ['ASAP', 'HIGH', 'MEDIUM', 'LOW'],
            description: 'Task priority',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Label names to add',
          },
          assigneeId: { type: 'string', description: 'User ID to assign to' },
        },
        required: ['name', 'workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          workspaceId: z.string().min(1),
          dueDate: z.string().optional(),
          duration: z.union([z.string(), z.number()]).optional(),
          status: z.string().optional(),
          autoScheduled: z
            .union([
              z.object({
                startDate: z.string(),
                deadlineType: z.enum(['HARD', 'SOFT', 'NONE']).optional(),
                schedule: z.string().optional(),
              }),
              z.null(),
            ])
            .optional(),
          projectId: z.string().optional(),
          description: z.string().optional(),
          priority: z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW']).optional(),
          labels: z.array(z.string()).optional(),
          assigneeId: z.string().optional(),
        });

        const validated = schema.parse(args);
        return await client.createTask(validated);
      },
    },
    {
      name: 'motion_update_task',
      description: 'Update an existing task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to update' },
          name: { type: 'string', description: 'New task title' },
          dueDate: { type: 'string', description: 'New due date (ISO 8601)' },
          duration: {
            type: ['string', 'number'],
            description: 'Duration: "NONE", "REMINDER", or minutes',
          },
          status: { type: 'string', description: 'New status' },
          priority: {
            type: 'string',
            enum: ['ASAP', 'HIGH', 'MEDIUM', 'LOW'],
            description: 'New priority',
          },
          description: { type: 'string', description: 'New description' },
          completed: { type: 'boolean', description: 'Mark as completed/uncompleted' },
          assigneeId: { type: 'string', description: 'New assignee ID' },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'New labels (replaces existing)',
          },
        },
        required: ['taskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          name: z.string().optional(),
          dueDate: z.string().optional(),
          duration: z.union([z.string(), z.number()]).optional(),
          status: z.string().optional(),
          priority: z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW']).optional(),
          description: z.string().optional(),
          completed: z.boolean().optional(),
          assigneeId: z.string().optional(),
          labels: z.array(z.string()).optional(),
        });

        const { taskId, ...updateParams } = schema.parse(args);
        return await client.updateTask(taskId, updateParams);
      },
    },
    {
      name: 'motion_delete_task',
      description: 'Delete a task permanently',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to delete' },
        },
        required: ['taskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.deleteTask(validated.taskId);
        return { success: true, message: `Task ${validated.taskId} deleted successfully` };
      },
    },
    {
      name: 'motion_move_task',
      description: 'Move a task to a different project',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to move' },
          projectId: { type: 'string', description: 'Target project ID' },
        },
        required: ['taskId', 'projectId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          projectId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.moveTask(validated.taskId, validated.projectId);
      },
    },
    {
      name: 'motion_complete_task',
      description: 'Mark a task as completed',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to complete' },
        },
        required: ['taskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.updateTask(validated.taskId, { completed: true });
      },
    },
    {
      name: 'motion_uncomplete_task',
      description: 'Mark a task as not completed',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID to uncomplete' },
        },
        required: ['taskId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.updateTask(validated.taskId, { completed: false });
      },
    },
  ];
}
