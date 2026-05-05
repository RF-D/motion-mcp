import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

const customFieldTypeEnum = [
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
] as const;

const valueTypeSchema = z.enum(customFieldTypeEnum);

export function registerCustomFieldTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_custom_fields',
      description: 'List all custom fields in a workspace',
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
        const { workspaceId } = schema.parse(args);
        const customFields = await client.listCustomFields(workspaceId);
        return {
          customFields,
          count: customFields.length,
        };
      },
    },
    {
      name: 'motion_create_custom_field',
      description:
        'Create a new custom field on a workspace. For select/multiSelect, pass options as strings (colors auto-assigned) or as {value, color} objects.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Custom field name' },
          type: {
            type: 'string',
            enum: customFieldTypeEnum as unknown as string[],
            description: 'Custom field type',
          },
          workspaceId: { type: 'string', description: 'Workspace ID' },
          options: {
            type: 'array',
            description:
              'Options for select/multiSelect fields. Each entry may be a plain string (color auto-assigned from a palette) or an object {value, color}.',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    value: { type: 'string' },
                    color: { type: 'string' },
                  },
                  required: ['value'],
                },
              ],
            },
          },
          metadata: {
            type: 'object',
            description:
              'Optional metadata bag. Use for number-field format (plain/formatted/percent) or checkbox toggle. Options for select fields are easier to pass via the `options` parameter.',
          },
        },
        required: ['name', 'type', 'workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          type: valueTypeSchema,
          workspaceId: z.string().min(1),
          options: z
            .array(
              z.union([
                z.string(),
                z.object({
                  value: z.string().min(1),
                  color: z.string().optional(),
                }),
              ])
            )
            .optional(),
          metadata: z.record(z.string(), z.any()).optional(),
        });
        const validated = schema.parse(args);
        return await client.createCustomField(validated);
      },
    },
    {
      name: 'motion_delete_custom_field',
      description: 'Delete a custom field definition from a workspace',
      inputSchema: {
        type: 'object',
        properties: {
          workspaceId: { type: 'string', description: 'Workspace ID' },
          customFieldId: { type: 'string', description: 'Custom field ID to delete' },
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
        return { success: true, message: 'Custom field deleted' };
      },
    },
    {
      name: 'motion_add_custom_field_to_task',
      description: 'Add a custom field value to a task',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          customFieldInstanceId: {
            type: 'string',
            description: 'Custom field ID (the cfi_... ID returned from create)',
          },
          type: {
            type: 'string',
            enum: customFieldTypeEnum as unknown as string[],
            description: 'Field type — must match the custom field definition',
          },
          value: {
            description:
              'The value to assign. Shape depends on type: string for text/select/url/email/phone/date/relatedTo; number for number; boolean for checkbox; string[] for multiSelect; userId for person; userId[] for multiPerson.',
          },
        },
        required: ['taskId', 'customFieldInstanceId', 'type', 'value'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          customFieldInstanceId: z.string().min(1),
          type: valueTypeSchema,
          value: z.any(),
        });
        const validated = schema.parse(args);
        const result = await client.addCustomFieldToTask(
          validated.taskId,
          validated.customFieldInstanceId,
          { type: validated.type, value: validated.value }
        );
        return { success: true, result };
      },
    },
    {
      name: 'motion_add_custom_field_to_project',
      description: 'Add a custom field value to a project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          customFieldInstanceId: {
            type: 'string',
            description: 'Custom field ID (the cfi_... ID returned from create)',
          },
          type: {
            type: 'string',
            enum: customFieldTypeEnum as unknown as string[],
            description: 'Field type — must match the custom field definition',
          },
          value: {
            description:
              'The value to assign. Shape depends on type (see motion_add_custom_field_to_task).',
          },
        },
        required: ['projectId', 'customFieldInstanceId', 'type', 'value'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
          customFieldInstanceId: z.string().min(1),
          type: valueTypeSchema,
          value: z.any(),
        });
        const validated = schema.parse(args);
        const result = await client.addCustomFieldToProject(
          validated.projectId,
          validated.customFieldInstanceId,
          { type: validated.type, value: validated.value }
        );
        return { success: true, result };
      },
    },
    {
      name: 'motion_remove_custom_field_from_task',
      description:
        'Remove a custom field VALUE from a task. Pass the value ID (not the field ID) — fetch the task to find it under customFieldValues.',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Task ID' },
          valueId: {
            type: 'string',
            description: 'The custom field VALUE ID (not the field definition ID).',
          },
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
        return { success: true, message: 'Custom field value removed from task' };
      },
    },
    {
      name: 'motion_remove_custom_field_from_project',
      description:
        'Remove a custom field VALUE from a project. Pass the value ID (not the field ID).',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID' },
          valueId: {
            type: 'string',
            description: 'The custom field VALUE ID (not the field definition ID).',
          },
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
        return { success: true, message: 'Custom field value removed from project' };
      },
    },
  ];
}
