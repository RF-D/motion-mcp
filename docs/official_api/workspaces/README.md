# Workspaces API

The Workspaces API provides access to workspace information and configuration in Motion.

## Overview

Workspaces in Motion:
- Organize tasks, projects, and team members
- Define available labels and statuses
- Can be team-based or individual
- Control access and visibility

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/workspaces` | [List workspaces](./list-workspaces.md) |

## Workspace Object

```javascript
{
  id: string,           // Unique workspace identifier
  name: string,         // Workspace display name
  teamId: string,       // Associated team ID
  type: string,         // "team" or "individual"
  labels: [             // Available labels
    { name: string }
  ],
  statuses: [           // Available statuses
    {
      name: string,
      isDefaultStatus: boolean,
      isResolvedStatus: boolean
    }
  ]
}
```

## Workspace Types

### Team Workspace

Shared workspace for team collaboration:
- Multiple members can access
- Shared projects and tasks
- Team-wide labels and statuses
- Collaborative environment

### Individual Workspace

Personal workspace for individual use:
- Private to the user
- Personal tasks and projects
- Custom labels and statuses
- Individual organization

## Working with Workspaces

### Task Organization

Tasks must belong to a workspace:
```javascript
POST /v1/tasks
{
  "name": "New Task",
  "workspaceId": "workspace_123"
}
```

### Project Creation

Projects are created within workspaces:
```javascript
POST /v1/projects
{
  "name": "New Project",
  "workspaceId": "workspace_123"
}
```

### Label Management

Labels are workspace-specific:
- Each workspace has its own set of labels
- Labels can be applied to tasks within that workspace
- New labels are created automatically when used

### Status Configuration

Statuses are defined per workspace:
- Each workspace has its own status workflow
- One default status for new items
- Multiple resolved statuses for completion

## Common Patterns

### 1. Department Workspaces

```
- Engineering Team (team workspace)
- Marketing Team (team workspace)
- Sales Team (team workspace)
```

### 2. Project-Based Workspaces

```
- Q1 2024 Initiatives (team workspace)
- Product Launch (team workspace)
- Customer Success (team workspace)
```

### 3. Mixed Environment

```
- Personal Tasks (individual workspace)
- Team Projects (team workspace)
- Client Work (team workspace)
```

## Best Practices

1. **Workspace Selection**: Choose appropriate workspace for task/project context
2. **Label Consistency**: Use consistent labeling within workspaces
3. **Status Workflows**: Understand each workspace's status flow
4. **Access Control**: Verify workspace access before operations
5. **Organization**: Use workspaces to separate different work contexts

## Important Notes

- Workspaces cannot be created or modified via API
- Workspace management is done through Motion app
- Users may have access to multiple workspaces
- Workspace type determines collaboration model
- All tasks and projects must belong to a workspace

## Related Resources

- [Tasks API](../tasks/) - Create tasks in workspaces
- [Projects API](../projects/) - Manage projects within workspaces
- [Statuses API](../statuses/) - Get workspace-specific statuses
- [Users API](../users/) - Users are members of workspaces