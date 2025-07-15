# Projects API

The Projects API provides functionality for managing projects in Motion, allowing you to organize tasks and track progress across initiatives.

## Overview

Projects in Motion help you:
- Group related tasks together
- Track progress on larger initiatives
- Manage project status and lifecycle
- Organize work by team or objective
- Apply custom fields for project-specific data

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/projects` | [List all projects](./list-projects.md) |
| GET | `/v1/projects/{id}` | [Get a specific project](./get-project.md) |
| POST | `/v1/projects` | [Create a new project](./create-project.md) |

## Project Object

```javascript
{
  id: string,                    // Unique project identifier
  name: string,                  // Project name
  description: string,           // HTML description
  workspaceId: string,          // Parent workspace ID
  status: {
    name: string,               // Status name
    isDefaultStatus: boolean,   // Whether this is the default
    isResolvedStatus: boolean   // Whether this indicates completion
  },
  createdTime: datetime,        // ISO 8601 creation timestamp
  updatedTime: datetime,        // ISO 8601 last update timestamp
  customFieldValues: {          // Custom field values
    "fieldName": {
      type: string,
      value: any
    }
  }
}
```

## Common Use Cases

### 1. Create a Project for a Sprint

```javascript
POST /v1/projects
{
  "name": "Sprint 24 - User Authentication",
  "workspaceId": "workspace_engineering",
  "description": "Implement user authentication and authorization features",
  "status": "In Progress"
}
```

### 2. Create a Marketing Campaign Project

```javascript
POST /v1/projects
{
  "name": "Q1 2024 Product Launch",
  "workspaceId": "workspace_marketing",
  "description": "Launch campaign for new product line including social media, email, and content marketing"
}
```

### 3. Create a Client Project

```javascript
POST /v1/projects
{
  "name": "Acme Corp Website Redesign",
  "workspaceId": "workspace_clients",
  "description": "Complete website redesign and development for Acme Corporation"
}
```

## Working with Projects

### Project Lifecycle

1. **Creation**: Projects start with a name and workspace
2. **Planning**: Add description and initial tasks
3. **Execution**: Tasks are worked on and completed
4. **Tracking**: Monitor progress through task completion
5. **Completion**: Mark project status as resolved

### Organizing Tasks

Tasks can be associated with projects to:
- Group related work items
- Track progress at project level
- Filter and report by project
- Manage team assignments

### Status Management

Projects use workspace-defined statuses. Common patterns:
- **Default statuses**: "Not Started", "Planning"
- **Active statuses**: "In Progress", "On Hold"
- **Resolved statuses**: "Completed", "Cancelled"

## Best Practices

1. **Naming Conventions**: Use clear, descriptive project names
2. **Description Details**: Include objectives, timelines, and key information
3. **Status Updates**: Keep project status current as work progresses
4. **Task Organization**: Group all related tasks under appropriate projects
5. **Custom Fields**: Use custom fields for project-specific metadata

## Limitations

- Projects cannot be moved between workspaces
- Project deletion is permanent and cannot be undone
- Projects must belong to a workspace (no standalone projects)
- Status options are limited to workspace-defined statuses

## Related Resources

- [Tasks API](../tasks/) - Create and manage tasks within projects
- [Workspaces API](../workspaces/) - Manage workspaces that contain projects
- [Custom Fields API](../custom-fields/) - Add custom data to projects
- [Statuses API](../statuses/) - View available project statuses