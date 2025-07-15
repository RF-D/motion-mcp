# Tasks API

The Tasks API provides comprehensive functionality for managing tasks in Motion, including creating, updating, scheduling, and organizing tasks.

## Overview

Tasks are the core unit of work in Motion. They can be:
- Scheduled automatically by Motion's AI
- Assigned to users
- Organized into projects
- Tagged with labels
- Customized with custom fields

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/tasks/{id}` | [Get a single task](./get-task.md) |
| GET | `/v1/tasks` | [List tasks with filtering](./list-tasks.md) |
| POST | `/v1/tasks` | [Create a new task](./create-task.md) |
| PATCH | `/v1/tasks/{id}` | [Update an existing task](./update-task.md) |
| DELETE | `/v1/tasks/{id}` | [Delete a task](./delete-task.md) |
| PATCH | `/v1/tasks/{id}/move` | [Move task to different workspace](./move-task.md) |
| DELETE | `/v1/tasks/{id}/assignee` | [Unassign a task](./unassign-task.md) |

## Task Object

```javascript
{
  // Identifiers
  id: string,
  name: string,
  description: string, // HTML content
  
  // Timing
  duration: string | number, // "NONE", "REMINDER", or minutes
  dueDate: datetime,
  deadlineType: "HARD" | "SOFT" | "NONE",
  startOn: string, // YYYY-MM-DD format
  
  // Status
  completed: boolean,
  completedTime: datetime,
  status: {
    name: string,
    isDefaultStatus: boolean,
    isResolvedStatus: boolean
  },
  
  // Scheduling
  scheduledStart: datetime,
  scheduledEnd: datetime,
  schedulingIssue: boolean,
  chunks: array, // Scheduled time blocks
  
  // Organization
  priority: "ASAP" | "HIGH" | "MEDIUM" | "LOW",
  labels: array<{ name: string }>,
  
  // Relationships
  workspace: object,
  project: object,
  creator: object,
  assignees: array<object>,
  
  // Metadata
  createdTime: datetime,
  updatedTime: datetime,
  lastInteractedTime: datetime,
  customFieldValues: record<CustomFieldValue>
}
```

## Common Use Cases

### 1. Creating a Simple Task

```javascript
POST /v1/tasks
{
  "name": "Review Q4 budget",
  "workspaceId": "workspace_123",
  "dueDate": "2024-12-31T17:00:00Z",
  "duration": 60
}
```

### 2. Creating an Auto-Scheduled Task

```javascript
POST /v1/tasks
{
  "name": "Prepare presentation",
  "workspaceId": "workspace_123",
  "dueDate": "2024-12-20T17:00:00Z",
  "duration": 120,
  "autoScheduled": {
    "startDate": "2024-12-15T09:00:00Z",
    "deadlineType": "SOFT",
    "schedule": "Work Hours"
  }
}
```

### 3. Filtering Tasks

```javascript
GET /v1/tasks?assigneeId=user_123&status=TODO,IN_PROGRESS&projectId=project_456
```

## Best Practices

1. **Use Auto-Scheduling**: Let Motion's AI schedule tasks optimally by providing `autoScheduled` parameters
2. **Set Appropriate Durations**: Provide realistic time estimates for better scheduling
3. **Use Labels**: Organize tasks with labels for easy filtering
4. **Handle Pagination**: Use cursor-based pagination for large task lists
5. **Check Scheduling Issues**: Monitor the `schedulingIssue` flag to identify scheduling conflicts

## Rate Limits

- Individual accounts: 12 requests per minute
- Team accounts: 120 requests per minute

## Related Resources

- [Projects API](../projects/) - Organize tasks into projects
- [Recurring Tasks API](../recurring-tasks/) - Create task templates
- [Custom Fields API](../custom-fields/) - Add custom data to tasks