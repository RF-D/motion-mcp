# Common Data Types

This document describes the common data types used throughout the Motion API.

## Date and Time

All datetime values use ISO 8601 format:

```
2024-01-15T09:00:00Z
2024-01-15T09:00:00.000Z
2024-01-15T09:00:00+00:00
```

## Task Priority

Tasks can have one of the following priority levels:

- `ASAP` - As soon as possible (highest priority)
- `HIGH` - High priority
- `MEDIUM` - Medium priority
- `LOW` - Low priority

## Task Duration

Task duration can be specified as:

- **Number**: Duration in minutes (e.g., `30`, `60`, `120`)
- **"NONE"**: No duration
- **"REMINDER"**: Reminder only (no duration)

## Task Status

Available statuses vary by workspace configuration. Common statuses include:

- `TODO`
- `IN_PROGRESS`
- `DONE`
- `CANCELLED`

Use the [List Statuses](./statuses/list-statuses.md) endpoint to get available statuses for your workspace.

## Labels

Labels are strings that can be attached to tasks for categorization. Examples:

- `"bug"`
- `"feature"`
- `"urgent"`
- `"client-work"`

## IDs

All resource IDs are strings in UUID format:

```
"550e8400-e29b-41d4-a716-446655440000"
```

## Pagination Cursor

Pagination cursors are opaque strings used for navigating through paginated results:

```
"eyJza2lwIjoyNX0="
```

## Common Response Fields

### Timestamps
- `createdTime` - When the resource was created
- `updatedTime` - When the resource was last updated
- `completedTime` - When a task was completed (if applicable)

### Relationships
- `workspace` - Object containing workspace details
- `project` - Object containing project details (if applicable)
- `creator` - User object who created the resource
- `assignees` - Array of user objects assigned to the task

### Task-Specific Fields
- `scheduledStart` - When Motion scheduled the task to start
- `scheduledEnd` - When Motion scheduled the task to end
- `schedulingIssue` - Boolean indicating if there's a scheduling problem

## Custom Field Values

Custom field values follow a discriminated union pattern:

```typescript
type CustomFieldValue = 
  | { type: "text"; value: string }
  | { type: "number"; value: number }
  | { type: "url"; value: string }
  | { type: "date"; value: string } // ISO 8601 date
  | { type: "email"; value: string }
  | { type: "phone"; value: string }
  | { type: "checkbox"; value: boolean }
  | { type: "select"; value: string }
  | { type: "multiSelect"; value: string[] }
  | { type: "person"; value: string } // User ID
  | { type: "multiPerson"; value: string[] } // Array of User IDs
  | { type: "relatedTo"; value: string } // Task ID
```