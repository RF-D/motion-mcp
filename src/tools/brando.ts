// Brando-layer convenience tools. These wrap the upstream Motion API tools
// with conventions that match how Brando works day-to-day:
//   - human-friendly names ("Stener", "Theo", "Shopify Core") instead of IDs
//   - automatic Linear (BRA-XXX) cross-linking in task descriptions
//   - sensible defaults for the primary developer (Stener)
//
// Designed to coexist with the upstream motion_* tools — anything Brando-specific
// lives behind motion_brando_*.

import { z } from 'zod';
import { MotionApiClient } from '../api/client.js';
import { Tool } from '../types/tool.js';
import { BRANDO_TEAM, findTeamMemberByAlias } from '../brando/team.js';
import {
  resolveAssignee,
  resolveProject,
  resolveWorkspace,
  clearResolverCache,
} from '../brando/resolvers.js';
import {
  extractLinearId,
  isValidLinearId,
  linearUrl,
  withLinearReference,
} from '../brando/linear.js';

export function registerBrandoTools(client: MotionApiClient): Tool[] {
  return [
    {
      name: 'motion_brando_team',
      description:
        'List the Brando team registry (Stener, Theo, Vegard) with aliases, emails, and roles. Useful for picking who to assign work to.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => ({ team: BRANDO_TEAM }),
    },

    {
      name: 'motion_brando_resolve',
      description:
        'Resolve a Brando workspace, project, or assignee name to its Motion ID. Useful for debugging which Motion entity a name maps to.',
      inputSchema: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['workspace', 'project', 'assignee'],
            description: 'What kind of entity to resolve',
          },
          name: {
            type: 'string',
            description:
              'Name, alias (stener/theo/vegard), email, or ID. Substring match on names.',
          },
          workspace: {
            type: 'string',
            description: 'Optional workspace name/ID to scope project or assignee lookup',
          },
        },
        required: ['kind', 'name'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          kind: z.enum(['workspace', 'project', 'assignee']),
          name: z.string().min(1),
          workspace: z.string().optional(),
        });
        const { kind, name, workspace } = schema.parse(args);
        if (kind === 'workspace') return await resolveWorkspace(client, name);
        if (kind === 'project') return await resolveProject(client, name, workspace);
        const wsId = workspace ? (await resolveWorkspace(client, workspace)).id : undefined;
        return await resolveAssignee(client, name, wsId);
      },
    },

    {
      name: 'motion_brando_create_task',
      description:
        'Create a Motion task with Brando defaults: pass workspace + project + assignee by NAME (e.g. "Shopify Core", "Stener"). Auto-detects BRA-XXX in the title or description and adds a Linear link.',
      inputSchema: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Task title' },
          workspace: {
            type: 'string',
            description: 'Workspace name or ID (e.g. "Brando")',
          },
          project: {
            type: 'string',
            description: 'Project name or ID (e.g. "Shopify Core")',
          },
          assignee: {
            type: 'string',
            description: 'Assignee alias/email/ID. Defaults to "stener" if omitted.',
          },
          description: { type: 'string', description: 'Markdown description' },
          linearId: {
            type: 'string',
            description: 'BRA-XXX to link. If omitted, parsed from name/description.',
          },
          dueDate: { type: 'string', description: 'ISO 8601 due date' },
          priority: {
            type: 'string',
            enum: ['ASAP', 'HIGH', 'MEDIUM', 'LOW'],
            description: 'Defaults to MEDIUM',
          },
          duration: {
            type: ['string', 'number'],
            description: '"NONE", "REMINDER", or minutes as integer',
          },
          autoSchedule: {
            type: 'boolean',
            description: 'If true, enables Motion auto-scheduling with SOFT deadline. Default true.',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Label names',
          },
        },
        required: ['name', 'workspace'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          name: z.string().min(1),
          workspace: z.string().min(1),
          project: z.string().optional(),
          assignee: z.string().optional(),
          description: z.string().optional(),
          linearId: z.string().optional(),
          dueDate: z.string().optional(),
          priority: z.enum(['ASAP', 'HIGH', 'MEDIUM', 'LOW']).optional(),
          duration: z.union([z.string(), z.number()]).optional(),
          autoSchedule: z.boolean().optional(),
          labels: z.array(z.string()).optional(),
        });
        const input = schema.parse(args);

        const ws = await resolveWorkspace(client, input.workspace);
        const project = input.project
          ? await resolveProject(client, input.project, ws.id)
          : undefined;
        const assigneeAlias = input.assignee ?? 'stener';
        const assignee = await resolveAssignee(client, assigneeAlias, ws.id);

        const detectedLinear =
          input.linearId ?? extractLinearId(input.name) ?? extractLinearId(input.description);
        if (input.linearId && !isValidLinearId(input.linearId)) {
          throw new Error(`linearId "${input.linearId}" is not in BRA-XXX format`);
        }
        const finalDescription = detectedLinear
          ? withLinearReference(input.description, detectedLinear)
          : input.description;

        const created = await client.createTask({
          name: input.name,
          workspaceId: ws.id,
          projectId: project?.id,
          assigneeId: assignee.id,
          description: finalDescription,
          dueDate: input.dueDate,
          priority: input.priority ?? 'MEDIUM',
          duration: input.duration,
          labels: input.labels,
          autoScheduled:
            input.autoSchedule === false
              ? null
              : { startDate: new Date().toISOString(), deadlineType: 'SOFT', schedule: 'Work Hours' },
        } as Parameters<MotionApiClient['createTask']>[0]);

        return {
          task: created,
          resolved: {
            workspace: ws,
            project,
            assignee,
            linearId: detectedLinear ?? null,
            linearUrl: detectedLinear ? linearUrl(detectedLinear) : null,
          },
        };
      },
    },

    {
      name: 'motion_brando_link_linear',
      description:
        'Add (or update) a Linear BRA-XXX reference inside an existing Motion task description.',
      inputSchema: {
        type: 'object',
        properties: {
          taskId: { type: 'string', description: 'Motion task ID' },
          linearId: { type: 'string', description: 'BRA-XXX issue identifier' },
        },
        required: ['taskId', 'linearId'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          taskId: z.string().min(1),
          linearId: z.string().min(1),
        });
        const { taskId, linearId } = schema.parse(args);
        if (!isValidLinearId(linearId)) {
          throw new Error(`linearId "${linearId}" is not in BRA-XXX format`);
        }
        const existing = (await client.getTask(taskId)) as { description?: string };
        const newDescription = withLinearReference(existing.description, linearId);
        const updated = await client.updateTask(taskId, {
          description: newDescription,
        } as Parameters<MotionApiClient['updateTask']>[1]);
        return { task: updated, linearUrl: linearUrl(linearId) };
      },
    },

    {
      name: 'motion_brando_my_tasks',
      description:
        'List Stener\'s tasks (the primary developer) across all Brando workspaces, filterable by status/project.',
      inputSchema: {
        type: 'object',
        properties: {
          workspace: { type: 'string', description: 'Optional workspace name/ID' },
          project: { type: 'string', description: 'Optional project name/ID' },
          status: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of statuses to include',
          },
          includeAllStatuses: { type: 'boolean', description: 'Include completed/archived tasks' },
        },
        required: [],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          workspace: z.string().optional(),
          project: z.string().optional(),
          status: z.array(z.string()).optional(),
          includeAllStatuses: z.boolean().optional(),
        });
        const input = schema.parse(args);
        const wsId = input.workspace
          ? (await resolveWorkspace(client, input.workspace)).id
          : undefined;
        const stener = await resolveAssignee(client, 'stener', wsId);
        const projectId = input.project
          ? (await resolveProject(client, input.project, input.workspace)).id
          : undefined;
        const response = await client.listTasks({
          assigneeId: stener.id,
          workspaceId: wsId,
          projectId,
          status: input.status,
          includeAllStatuses: input.includeAllStatuses,
        });
        return { tasks: response.tasks, count: response.tasks?.length ?? 0 };
      },
    },

    {
      name: 'motion_brando_team_tasks',
      description:
        'List tasks assigned to a Brando team member by alias (stener/theo/vegard).',
      inputSchema: {
        type: 'object',
        properties: {
          member: {
            type: 'string',
            description: 'Brando alias (stener/theo/vegard) or email',
          },
          workspace: { type: 'string', description: 'Optional workspace name/ID' },
          status: {
            type: 'array',
            items: { type: 'string' },
            description: 'Optional list of statuses to include',
          },
          includeAllStatuses: { type: 'boolean' },
        },
        required: ['member'],
      },
      handler: async (args: unknown) => {
        const schema = z.object({
          member: z.string().min(1),
          workspace: z.string().optional(),
          status: z.array(z.string()).optional(),
          includeAllStatuses: z.boolean().optional(),
        });
        const input = schema.parse(args);
        const known = findTeamMemberByAlias(input.member);
        const wsId = input.workspace
          ? (await resolveWorkspace(client, input.workspace)).id
          : undefined;
        const assignee = await resolveAssignee(client, known?.email ?? input.member, wsId);
        const response = await client.listTasks({
          assigneeId: assignee.id,
          workspaceId: wsId,
          status: input.status,
          includeAllStatuses: input.includeAllStatuses,
        });
        return {
          member: known ?? assignee,
          tasks: response.tasks,
          count: response.tasks?.length ?? 0,
        };
      },
    },

    {
      name: 'motion_brando_refresh_cache',
      description:
        'Clear the in-memory Brando resolver cache (workspaces/projects/users). Call this if Motion data was changed externally.',
      inputSchema: {
        type: 'object',
        properties: {},
        required: [],
      },
      handler: async () => {
        clearResolverCache();
        return { ok: true };
      },
    },
  ];
}
