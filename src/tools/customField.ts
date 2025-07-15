import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerCustomFieldTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_custom_fields',
      description: 'List all custom fields for a workspace',
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
          metadata: {
            type: 'object',
            description: 'Metadata for the field (e.g., options for select fields)',
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
          metadata: z.object({}).passthrough().optional(),
        });

        const validated = schema.parse(args);
        return await client.createCustomField(validated);
      },
    },
    {
      name: 'motion_delete_custom_field',
      description: 'Delete a custom field',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          customFieldId: { type: 'string', description: 'Custom field ID' },
        },
        required: ['workspaceId', 'customFieldId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspaceId: z.string().min(1),
          customFieldId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.deleteCustomField(validated.workspaceId, validated.customFieldId);
        return { success: true, message: 'Custom field deleted successfully' };
      },
    },
    {
      name: 'motion_add_custom_field_to_task',
      description: 'Add a custom field value to a task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          customFieldInstanceId: { type: 'string', description: 'Custom field instance ID' },
          value: { description: 'Custom field value (type depends on field type)' },
        },
        required: ['taskId', 'customFieldInstanceId', 'value'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          customFieldInstanceId: z.string().min(1),
          value: z.any(),
        });

        const validated = schema.parse(args);
        await client.addCustomFieldToTask(
          validated.taskId,
          validated.customFieldInstanceId,
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
          customFieldInstanceId: { type: 'string', description: 'Custom field instance ID' },
          value: { description: 'Custom field value (type depends on field type)' },
        },
        required: ['projectId', 'customFieldInstanceId', 'value'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
          customFieldInstanceId: z.string().min(1),
          value: z.any(),
        });

        const validated = schema.parse(args);
        await client.addCustomFieldToProject(
          validated.projectId,
          validated.customFieldInstanceId,
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
          valueId: { type: 'string', description: 'Custom field value ID to remove' },
        },
        required: ['taskId', 'valueId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          valueId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.removeCustomFieldFromTask(validated.taskId, validated.valueId);
        return { success: true, message: 'Custom field removed from task successfully' };
      },
    },
    {
      name: 'motion_remove_custom_field_from_project',
      description: 'Remove a custom field value from a project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          valueId: { type: 'string', description: 'Custom field value ID to remove' },
        },
        required: ['projectId', 'valueId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
          valueId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.removeCustomFieldFromProject(validated.projectId, validated.valueId);
        return { success: true, message: 'Custom field removed from project successfully' };
      },
    },
  ];
}
