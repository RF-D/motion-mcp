import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerCustomFieldTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_custom_fields',
      description: 'List all custom fields, optionally filtered by workspace',
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
        const customFields = await client.listCustomFields(validated.workspaceId);

        return {
          customFields,
          count: customFields.length,
        };
      },
    },
    {
      name: 'motion_create_custom_field',
      description: 'Create a new custom field',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Custom field name' },
          type: {
            type: 'string',
            enum: [
              'text',
              'number',
              'url',
              'date',
              'select',
              'multiSelect',
              'person',
              'multiPerson',
              'email',
              'phone',
              'checkbox',
              'relatedTo',
            ],
            description: 'Custom field type',
          },
          workspaceId: { type: 'string', description: 'Workspace ID' },
          options: {
            type: 'array',
            items: { type: 'string' },
            description: 'Options for select/multiSelect fields',
          },
        },
        required: ['name', 'type', 'workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          type: z.enum([
            'text',
            'number',
            'url',
            'date',
            'select',
            'multiSelect',
            'person',
            'multiPerson',
            'email',
            'phone',
            'checkbox',
            'relatedTo',
          ]),
          workspaceId: z.string().min(1),
          options: z.array(z.string()).optional(),
        });

        const validated = schema.parse(args);
        return await client.createCustomField(validated);
      },
    },
    {
      name: 'motion_add_custom_field_to_task',
      description: 'Add a custom field value to a task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          customFieldId: { type: 'string', description: 'Custom field ID' },
          value: { description: 'Custom field value (type depends on field type)' },
        },
        required: ['taskId', 'customFieldId', 'value'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          customFieldId: z.string().min(1),
          value: z.any(),
        });

        const validated = schema.parse(args);
        await client.addCustomFieldToTask(
          validated.taskId,
          validated.customFieldId,
          validated.value
        );
        return { success: true, message: 'Custom field added to task successfully' };
      },
    },
    {
      name: 'motion_add_custom_field_to_project',
      description: 'Add a custom field value to a project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          customFieldId: { type: 'string', description: 'Custom field ID' },
          value: { description: 'Custom field value (type depends on field type)' },
        },
        required: ['projectId', 'customFieldId', 'value'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
          customFieldId: z.string().min(1),
          value: z.any(),
        });

        const validated = schema.parse(args);
        await client.addCustomFieldToProject(
          validated.projectId,
          validated.customFieldId,
          validated.value
        );
        return { success: true, message: 'Custom field added to project successfully' };
      },
    },
    {
      name: 'motion_remove_custom_field_from_task',
      description: 'Remove a custom field value from a task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          customFieldId: { type: 'string', description: 'Custom field ID' },
        },
        required: ['taskId', 'customFieldId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          customFieldId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.removeCustomFieldFromTask(validated.taskId, validated.customFieldId);
        return { success: true, message: 'Custom field removed from task successfully' };
      },
    },
  ];
}
