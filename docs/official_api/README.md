# Motion API Documentation

This is the official Motion API documentation, organized by resource type and API methods.

## Base URL

```
https://api.usemotion.com/v1
```

For beta endpoints (custom fields):
```
https://api.usemotion.com/beta
```

## Authentication

All API requests require authentication using an API key in the request header:

```
X-API-Key: YOUR_API_KEY
```

## Rate Limits

- Individual accounts: 12 requests per minute
- Team accounts: 120 requests per minute

## API Resources

### Core Resources

- **[Tasks](./tasks/)** - Core task management functionality
  - [Overview](./tasks/README.md)
  - [Get Task](./tasks/get-task.md)
  - [List Tasks](./tasks/list-tasks.md)
  - [Create Task](./tasks/create-task.md)
  - [Update Task](./tasks/update-task.md)
  - [Delete Task](./tasks/delete-task.md)
  - [Move Task](./tasks/move-task.md)
  - [Unassign Task](./tasks/unassign-task.md)

- **[Projects](./projects/)** - Project management
  - [Overview](./projects/README.md)
  - [Get Project](./projects/get-project.md)
  - [List Projects](./projects/list-projects.md)
  - [Create Project](./projects/create-project.md)

- **[Recurring Tasks](./recurring-tasks/)** - Recurring task templates
  - [Overview](./recurring-tasks/README.md)
  - [Get Recurring Task](./recurring-tasks/get-recurring-task.md)
  - [Create Recurring Task](./recurring-tasks/create-recurring-task.md)
  - [Delete Recurring Task](./recurring-tasks/delete-recurring-task.md)

- **[Comments](./comments/)** - Task comments
  - [Overview](./comments/README.md)
  - [Get Comments](./comments/get-comments.md)
  - [Create Comment](./comments/create-comment.md)

### User & Workspace Resources

- **[Users](./users/)** - User information
  - [Overview](./users/README.md)
  - [Get User](./users/get-user.md)
  - [Get Current User](./users/get-current-user.md)

- **[Workspaces](./workspaces/)** - Workspace management
  - [Overview](./workspaces/README.md)
  - [List Workspaces](./workspaces/list-workspaces.md)

- **[Schedules](./schedules/)** - Work hour configurations
  - [Overview](./schedules/README.md)
  - [Get Schedules](./schedules/get-schedules.md)

- **[Statuses](./statuses/)** - Available task/project statuses
  - [Overview](./statuses/README.md)
  - [List Statuses](./statuses/list-statuses.md)

### Beta Features

- **[Custom Fields](./custom-fields/)** (Beta) - Custom field management
  - [Overview](./custom-fields/README.md)
  - [List Custom Fields](./custom-fields/list-custom-fields.md)
  - [Create Custom Field](./custom-fields/create-custom-field.md)
  - [Delete Custom Field](./custom-fields/delete-custom-field.md)
  - [Add to Task](./custom-fields/add-to-task.md)
  - [Remove from Task](./custom-fields/remove-from-task.md)
  - [Add to Project](./custom-fields/add-to-project.md)
  - [Remove from Project](./custom-fields/remove-from-project.md)

## Common Patterns

### Pagination

List endpoints support cursor-based pagination:

```json
{
  "meta": {
    "nextCursor": "cursor_string",
    "pageSize": 25
  },
  "tasks": [...]
}
```

### Date Format

All datetime values use ISO 8601 format:
```
2024-01-15T09:00:00Z
```

### Response Format

Successful responses return the requested resource(s). Error responses include:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

## Getting Started

1. Obtain an API key from your Motion account settings
2. Choose the appropriate endpoint for your use case
3. Make authenticated requests using your API key
4. Handle rate limits and pagination appropriately

## Support

For API support, please contact Motion support. The API is intended for advanced users who need programmatic access to Motion's functionality.