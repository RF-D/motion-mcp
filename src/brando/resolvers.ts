// Resolvers translate human-friendly names into Motion IDs by querying
// the API at call time. Results are cached for the lifetime of the process
// so repeated tool calls don't refetch every workspace/user list.

import { MotionApiClient } from '../api/client.js';
import { BRANDO_TEAM, findTeamMemberByAlias } from './team.js';

interface ResolverCache {
  workspaces?: Array<{ id: string; name: string }>;
  projectsByWorkspace: Map<string, Array<{ id: string; name: string; workspaceId: string }>>;
  usersByWorkspace: Map<string, Array<{ id: string; name?: string; email?: string }>>;
}

const cache: ResolverCache = {
  projectsByWorkspace: new Map(),
  usersByWorkspace: new Map(),
};

export async function resolveWorkspace(
  client: MotionApiClient,
  nameOrId: string
): Promise<{ id: string; name: string }> {
  if (!cache.workspaces) {
    cache.workspaces = (await client.listWorkspaces()) as Array<{ id: string; name: string }>;
  }
  const direct = cache.workspaces.find((w) => w.id === nameOrId);
  if (direct) return direct;
  const lower = nameOrId.trim().toLowerCase();
  const match = cache.workspaces.find((w) => w.name?.toLowerCase().includes(lower));
  if (!match) {
    throw new Error(
      `No workspace matched "${nameOrId}". Available: ${cache.workspaces.map((w) => w.name).join(', ')}`
    );
  }
  return match;
}

export async function resolveProject(
  client: MotionApiClient,
  nameOrId: string,
  workspaceHint?: string
): Promise<{ id: string; name: string; workspaceId: string }> {
  let workspaceIds: string[];
  if (workspaceHint) {
    const ws = await resolveWorkspace(client, workspaceHint);
    workspaceIds = [ws.id];
  } else {
    if (!cache.workspaces) cache.workspaces = await client.listWorkspaces();
    workspaceIds = cache.workspaces.map((w) => w.id);
  }

  for (const wsId of workspaceIds) {
    if (!cache.projectsByWorkspace.has(wsId)) {
      const projects = (await client.listProjects(wsId)) as Array<{
        id: string;
        name: string;
        workspaceId?: string;
      }>;
      cache.projectsByWorkspace.set(
        wsId,
        projects.map((p) => ({ id: p.id, name: p.name, workspaceId: p.workspaceId ?? wsId }))
      );
    }
  }

  const all = workspaceIds.flatMap((id) => cache.projectsByWorkspace.get(id) ?? []);
  const direct = all.find((p) => p.id === nameOrId);
  if (direct) return direct;
  const lower = nameOrId.trim().toLowerCase();
  const match = all.find((p) => p.name?.toLowerCase().includes(lower));
  if (!match) {
    throw new Error(
      `No project matched "${nameOrId}"${workspaceHint ? ` in workspace "${workspaceHint}"` : ''}.`
    );
  }
  return match;
}

export async function resolveAssignee(
  client: MotionApiClient,
  nameOrIdOrAlias: string,
  workspaceId?: string
): Promise<{ id: string; name?: string; email?: string }> {
  const teamMember = findTeamMemberByAlias(nameOrIdOrAlias);
  const lookupKey = teamMember ? teamMember.email.toLowerCase() : nameOrIdOrAlias.toLowerCase();

  const workspaceIds = workspaceId
    ? [workspaceId]
    : (cache.workspaces ?? (await client.listWorkspaces())).map((w) => w.id);

  for (const wsId of workspaceIds) {
    if (!cache.usersByWorkspace.has(wsId)) {
      const users = (await client.listUsers(wsId)) as Array<{
        id: string;
        name?: string;
        email?: string;
      }>;
      cache.usersByWorkspace.set(wsId, users);
    }
  }

  const all = workspaceIds.flatMap((id) => cache.usersByWorkspace.get(id) ?? []);
  const direct = all.find((u) => u.id === nameOrIdOrAlias);
  if (direct) return direct;
  const match = all.find(
    (u) => u.email?.toLowerCase() === lookupKey || u.name?.toLowerCase().includes(lookupKey)
  );
  if (!match) {
    const known = BRANDO_TEAM.map((m) => `${m.alias} (${m.email})`).join(', ');
    throw new Error(
      `Could not resolve assignee "${nameOrIdOrAlias}". Known Brando aliases: ${known}.`
    );
  }
  return match;
}

export function clearResolverCache(): void {
  cache.workspaces = undefined;
  cache.projectsByWorkspace.clear();
  cache.usersByWorkspace.clear();
}
