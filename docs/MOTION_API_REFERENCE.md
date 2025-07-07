# Motion API Reference

This document provides a comprehensive reference for the Motion API based on the official documentation.

## Authentication

All API requests require authentication using an API key:
- Header: `X-API-Key: <your-api-key>`
- Base URL: `https://api.usemotion.com/v1`

## Rate Limits

- **Individual tier**: 12 requests per minute
- **Team tier**: 120 requests per minute
- **Enterprise tier**: Custom limits available

## Core Endpoints

### Tasks

#### List Tasks
`GET /v1/tasks`

Query parameters:
- `assigneeId` (string): Filter by assignee
- `cursor` (string): Pagination cursor
- `includeAllStatuses` (boolean): Include all status types
- `label` (string): Filter by label
- `name` (string): Filter by name (case-insensitive)
- `projectId` (string): Filter by project
- `status` (array<string>): Filter by specific statuses
- `workspaceId` (string): Filter by workspace

Response includes:
- Task details (id, name, description, duration, dueDate, etc.)
- Project information
- Workspace information
- Assignees
- Labels
- Custom field values
- Scheduling information (scheduledStart, scheduledEnd, chunks)

#### Create Task
`POST /v1/tasks`

Required fields:
- `name` (string): Task title
- `workspaceId` (string): Workspace ID

Optional fields:
- `dueDate` (datetime): ISO 8601 date (required for scheduled tasks)
- `duration` (string|number): "NONE", "REMINDER", or minutes as integer
- `status` (string): Defaults to workspace default
- `autoScheduled` (object): Auto-scheduling configuration
  - `startDate` (datetime): Start date
  - `deadlineType` (string): "HARD", "SOFT", or "NONE"
  - `schedule` (string): Must be "Work Hours" if assigning to another user
- `projectId` (string): Associated project
- `description` (string): GitHub Flavored Markdown
- `priority` (string): "ASAP", "HIGH", "MEDIUM", or "LOW"
- `labels` (array<string>): Label names
- `assigneeId` (string): User ID to assign to

#### Get Task
`GET /v1/tasks/{taskId}`

#### Update Task
`PATCH /v1/tasks/{taskId}`

#### Delete Task
`DELETE /v1/tasks/{taskId}`

### Projects

#### List Projects
`GET /v1/projects`

Query parameters:
- `workspaceId` (string): Filter by workspace

#### Get Project
`GET /v1/projects/{projectId}`

#### Create Project
`POST /v1/projects`

### Workspaces

#### List Workspaces
`GET /v1/workspaces`

#### Get Workspace
`GET /v1/workspaces/{workspaceId}`

### Users

#### Get Current User
`GET /v1/users/me`

#### Get User
`GET /v1/users/{userId}`

### Schedules

#### Get Schedule
`GET /v1/schedules`

Query parameters:
- `userId` (string): User ID
- `startDate` (date): Start date
- `endDate` (date): End date

### Comments

#### List Comments
`GET /v1/comments`

Query parameters:
- `taskId` (string): Filter by task

#### Create Comment
`POST /v1/comments`

Required fields:
- `taskId` (string): Task ID
- `content` (string): Comment content

#### Get Comment
`GET /v1/comments/{commentId}`

### Custom Fields

#### List Custom Fields
`GET /v1/custom-fields`

#### Create Custom Field
`POST /v1/custom-fields`

#### Add to Task
`POST /v1/custom-fields/add-to-task`

#### Add to Project
`POST /v1/custom-fields/add-to-project`

#### Delete from Task
`DELETE /v1/custom-fields/delete-from-task`

### Recurring Tasks

#### List Recurring Tasks
`GET /v1/recurring-tasks`

#### Create Recurring Task
`POST /v1/recurring-tasks`

#### Get Recurring Task
`GET /v1/recurring-tasks/{recurringTaskId}`

### Statuses

#### Get Status
`GET /v1/statuses/{statusId}`

## Data Types

### Task Object
- `id` (string): Unique identifier
- `name` (string): Task name
- `description` (string): HTML description
- `duration` (string|number): Duration in minutes or special values
- `dueDate` (datetime): Due date
- `deadlineType` (string): "HARD", "SOFT", or "NONE"
- `parentRecurringTaskId` (string): Parent recurring task if applicable
- `completed` (boolean): Completion status
- `completedTime` (datetime): Completion timestamp
- `priority` (string): Priority level
- `labels` (array): Associated labels
- `assignees` (array): Assigned users
- `scheduledStart` (datetime): Scheduled start time
- `scheduledEnd` (datetime): Scheduled end time
- `schedulingIssue` (boolean): Indicates scheduling problems
- `customFieldValues` (object): Custom field data
- `chunks` (array): Scheduling chunks

### Custom Field Types
- `text`: Plain text field
- `number`: Numeric field
- `url`: URL field
- `date`: Date field
- `select`: Single selection
- `multiSelect`: Multiple selection
- `person`: Single person reference
- `multiPerson`: Multiple person references
- `email`: Email field
- `phone`: Phone number field
- `checkbox`: Boolean field
- `relatedTo`: Related task reference

### Workspace Object
- `id` (string): Unique identifier
- `name` (string): Workspace name
- `teamId` (string): Associated team
- `type` (string): "team" or "individual"
- `labels` (array): Available labels
- `statuses` (array): Available statuses

### Project Object
- `id` (string): Unique identifier
- `name` (string): Project name
- `description` (string): HTML description
- `workspaceId` (string): Parent workspace
- `status` (object): Project status
- `customFieldValues` (object): Custom field data

## Pagination

List endpoints support cursor-based pagination:
- Response includes `meta.nextCursor`
- Pass `cursor` parameter in subsequent requests
- `meta.pageSize` indicates number of results

## Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `429`: Rate Limit Exceeded
- `500`: Internal Server Error

## Best Practices

1. Always handle rate limits with exponential backoff
2. Use pagination for large result sets
3. Cache workspace and project data when possible
4. Batch operations where supported
5. Use auto-scheduling for better task management
6. Respect the "Work Hours" schedule requirement when assigning tasks to others