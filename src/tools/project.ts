import { MotionApiClient } from '../api/client.js';
import { z } from 'zod';
import { Tool } from '../types/tool.js';

export function registerProjectTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_list_projects',
      description: 'List all projects in a workspace',
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
        const projects = await client.listProjects(validated.workspaceId);

        return {
          projects,
          count: projects.length,
        };
      },
    },
    {
      name: 'motion_get_project',
      description: 'Get detailed information about a specific project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'The ID of the project to retrieve' },
        },
        required: ['projectId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
        });

        const validated = schema.parse(args);
        return await client.getProject(validated.projectId);
      },
    },
    {
      name: 'motion_create_project',
      description: 'Create a new project in Motion',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Project name' },
          workspaceId: { type: 'string', description: 'Workspace ID' },
          description: { type: 'string', description: 'Project description (supports HTML/Markdown)' },
          status: { type: 'string', description: 'Initial project status (must be valid for workspace)' },
          customFieldValues: {
            type: 'object',
            description: 'Custom field values as key-value pairs',
            additionalProperties: true,
          },
        },
        required: ['name', 'workspaceId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          workspaceId: z.string().min(1),
          description: z.string().optional(),
          status: z.string().optional(),
          customFieldValues: z.record(z.any()).optional(),
        });

        const validated = schema.parse(args);
        return await client.createProject(validated);
      },
    },
    {
      name: 'motion_update_project',
      description: 'Update an existing project',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID to update' },
          name: { type: 'string', description: 'New project name' },
          description: { type: 'string', description: 'New project description' },
          status: { type: 'string', description: 'New project status' },
          customFieldValues: {
            type: 'object',
            description: 'Custom field values as key-value pairs (only include fields to update)',
            additionalProperties: true,
          },
        },
        required: ['projectId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
          name: z.string().optional(),
          description: z.string().optional(),
          status: z.string().optional(),
          customFieldValues: z.record(z.any()).optional(),
        });

        const { projectId, ...updateParams } = schema.parse(args);

        // Only include non-undefined fields
        const filteredParams: any = {};
        if (updateParams.name !== undefined) filteredParams.name = updateParams.name;
        if (updateParams.description !== undefined)
          filteredParams.description = updateParams.description;
        if (updateParams.status !== undefined) filteredParams.status = updateParams.status;
        if (updateParams.customFieldValues !== undefined)
          filteredParams.customFieldValues = updateParams.customFieldValues;

        return await client.updateProject(projectId, filteredParams);
      },
    },
    {
      name: 'motion_delete_project',
      description: 'Delete a project permanently',
      inputSchema: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project ID to delete' },
        },
        required: ['projectId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          projectId: z.string().min(1),
        });

        const validated = schema.parse(args);
        await client.deleteProject(validated.projectId);
        return { success: true, message: `Project ${validated.projectId} deleted successfully` };
      },
    },
  ];
}
