# Statuses API

The Statuses API provides access to available task and project statuses within workspaces.

## Overview

Statuses in Motion:
- Define the workflow states for tasks and projects
- Can be customized per workspace
- Include metadata about default and completion states
- Control task visibility and scheduling behavior

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/statuses` | [List available statuses](./list-statuses.md) |

## Status Object

```javascript
{
  name: string,               // Status display name
  isDefaultStatus: boolean,   // Whether this is the default for new items
  isResolvedStatus: boolean   // Whether this indicates completion
}
```

## Common Status Types

### Task Statuses

Typical task workflow statuses:
- **TODO** - Default status for new tasks
- **In Progress** - Task being worked on
- **Blocked** - Task cannot proceed
- **Done** - Task completed (resolved)
- **Cancelled** - Task cancelled (resolved)

### Project Statuses

Common project lifecycle statuses:
- **Planning** - Project in planning phase
- **Active** - Project being executed
- **On Hold** - Project temporarily paused
- **Completed** - Project finished (resolved)
- **Archived** - Project archived (resolved)

## Status Properties

### Default Status

- One status per workspace is marked as default
- New tasks/projects automatically get this status
- Usually "TODO" or "Planning"

### Resolved Status

- Indicates completion or termination
- Tasks with resolved status:
  - Don't appear in active task lists
  - Are excluded from scheduling
  - Show as completed in reports

## Using Statuses

### Task Creation

When creating tasks, specify a valid status:
```javascript
{
  "name": "New Task",
  "status": "In Progress",
  "workspaceId": "workspace_123"
}
```

### Status Transitions

Update task status to move through workflow:
```javascript
// Move task to completed
PATCH /v1/tasks/{id}
{
  "status": "Done"
}
```

## Best Practices

1. **Use Workspace Statuses**: Only use statuses available in the target workspace
2. **Check Status Type**: Use `isResolvedStatus` to identify completion statuses
3. **Default Handling**: Omit status to use workspace default
4. **Workflow Design**: Create statuses that match your team's workflow

## Important Notes

- Statuses are defined at the workspace level
- Cannot create or modify statuses via API
- Status names must match exactly (case-sensitive)
- Different workspaces may have different statuses

## Related Resources

- [Tasks API](../tasks/) - Apply statuses to tasks
- [Projects API](../projects/) - Apply statuses to projects
- [Workspaces API](../workspaces/) - Statuses are workspace-specific