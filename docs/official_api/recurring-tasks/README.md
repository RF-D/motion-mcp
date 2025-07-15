# Recurring Tasks API

The Recurring Tasks API allows you to create and manage task templates that automatically generate tasks on a recurring schedule.

## Overview

Recurring tasks are perfect for:
- Regular meetings (daily standups, weekly 1-on-1s)
- Routine maintenance tasks
- Periodic reports and reviews
- Scheduled check-ins and follow-ups
- Repeating project milestones

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/recurring-tasks` | [List recurring tasks](./list-recurring-tasks.md) |
| POST | `/v1/recurring-tasks` | [Create a recurring task](./create-recurring-task.md) |
| DELETE | `/v1/recurring-tasks/{id}` | [Delete a recurring task](./delete-recurring-task.md) |

## Recurring Task Object

```javascript
{
  id: string,                    // Unique identifier
  name: string,                  // Task template name
  frequency: string,             // Recurrence pattern
  creator: {                     // Creator information
    id: string,
    name: string,
    email: string
  },
  assignee: {                    // Assigned user
    id: string,
    name: string,
    email: string
  },
  project: {                     // Associated project (if any)
    id: string,
    name: string,
    description: string,
    workspaceId: string,
    status: object,
    customFieldValues: object
  },
  workspace: {                   // Workspace details
    id: string,
    name: string,
    teamId: string,
    type: string,
    labels: array,
    statuses: array
  },
  status: object,               // Task status
  priority: string,             // Task priority
  labels: array,                // Task labels
  description: string,          // Task description
  duration: string | number,    // Task duration
  deadlineType: string,         // Deadline type
  startingOn: string,          // Start date
  idealTime: string,           // Preferred time
  schedule: string             // Schedule name
}
```

## Frequency Options

Recurring tasks support various frequency patterns:
- Daily
- Weekly (specific days)
- Monthly (specific dates)
- Custom patterns

## Common Use Cases

### 1. Daily Standup Meeting

```javascript
POST /v1/recurring-tasks
{
  "name": "Daily Standup",
  "frequency": "DAILY",
  "workspaceId": "workspace_123",
  "assigneeId": "user_456",
  "duration": 15,
  "idealTime": "09:00",
  "priority": "HIGH"
}
```

### 2. Weekly Report

```javascript
POST /v1/recurring-tasks
{
  "name": "Weekly Status Report",
  "frequency": "WEEKLY_FRIDAY",
  "workspaceId": "workspace_123",
  "assigneeId": "user_789",
  "duration": 60,
  "deadlineType": "SOFT",
  "description": "Compile and send weekly status report to leadership"
}
```

### 3. Monthly Review

```javascript
POST /v1/recurring-tasks
{
  "name": "Monthly Performance Review",
  "frequency": "MONTHLY_LAST",
  "workspaceId": "workspace_123",
  "assigneeId": "user_manager",
  "duration": 120,
  "priority": "HIGH",
  "projectId": "project_reviews"
}
```

## Task Generation

When a recurring task is created:
1. Motion generates individual task instances based on the frequency
2. Each instance is scheduled according to the specified parameters
3. Tasks are auto-scheduled if the assignee has auto-scheduling enabled
4. New instances are created as previous ones are completed

## Best Practices

1. **Clear Naming**: Use descriptive names that indicate the recurring nature
2. **Appropriate Duration**: Set realistic time estimates for recurring work
3. **Deadline Types**: Use SOFT deadlines for flexible tasks, HARD for critical ones
4. **Ideal Times**: Specify preferred times for time-sensitive recurring tasks
5. **Project Association**: Group related recurring tasks under projects

## Important Notes

- Deleting a recurring task doesn't delete already-created task instances
- Changes to recurring tasks only affect future instances
- Each workspace can have multiple recurring tasks
- Recurring tasks follow the same scheduling rules as regular tasks

## Related Resources

- [Tasks API](../tasks/) - Manage individual task instances
- [Projects API](../projects/) - Organize recurring tasks in projects
- [Schedules API](../schedules/) - Configure work schedules