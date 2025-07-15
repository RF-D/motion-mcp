# Create Recurring Task

Create a new recurring task template that automatically generates tasks on a schedule.

## Endpoint

```
POST /v1/recurring-tasks
```

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| frequency | string | Yes | Task recurrence pattern |
| name | string | Yes | Task name |
| workspaceId | string | Yes | Workspace ID |
| assigneeId | string | Yes | User ID to assign tasks to |
| deadlineType | string | No | "HARD" or "SOFT" (default: "SOFT") |
| duration | integer \| string | No | Minutes > 0 or "REMINDER" |
| startingOn | string | No | ISO 8601 date when to start |
| idealTime | string | No | Preferred time (HH:mm format) |
| schedule | string | No | Schedule name (default: "Work Hours") |
| description | string | No | Task description |
| priority | string | No | "HIGH" or "MEDIUM" (default: "MEDIUM") |
| projectId | string | No | Project ID to associate with |
| labels | array<string> | No | Array of label names |

### Frequency Options

Common frequency patterns:
- `DAILY` - Every day
- `WEEKLY_MONDAY` through `WEEKLY_SUNDAY` - Weekly on specific day
- `MONTHLY_1` through `MONTHLY_31` - Monthly on specific date
- `MONTHLY_LAST` - Last day of month

### Example Request

```bash
curl -X POST https://api.usemotion.com/v1/recurring-tasks \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Daily Standup Meeting",
    "frequency": "DAILY",
    "workspaceId": "workspace_123",
    "assigneeId": "user_456",
    "duration": 15,
    "priority": "HIGH",
    "deadlineType": "SOFT",
    "idealTime": "09:00",
    "description": "Daily team sync to discuss progress and blockers",
    "labels": ["meeting", "standup"],
    "projectId": "project_meetings"
  }'
```

## Response

### Success Response (201 Created)

Returns the created recurring task object:

```json
{
  "id": "recurring_new_123",
  "name": "Daily Standup Meeting",
  "frequency": "DAILY",
  "creator": {
    "id": "user_current",
    "name": "Current User",
    "email": "current@example.com"
  },
  "assignee": {
    "id": "user_456",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "project": {
    "id": "project_meetings",
    "name": "Team Meetings",
    "workspaceId": "workspace_123"
  },
  "workspace": {
    "id": "workspace_123",
    "name": "Engineering Team",
    "teamId": "team_456",
    "type": "team"
  },
  "status": {
    "name": "TODO",
    "isDefaultStatus": true,
    "isResolvedStatus": false
  },
  "priority": "HIGH",
  "labels": [
    { "name": "meeting" },
    { "name": "standup" }
  ],
  "description": "Daily team sync to discuss progress and blockers",
  "duration": 15,
  "deadlineType": "SOFT",
  "startingOn": "2024-12-16",
  "idealTime": "09:00",
  "schedule": "Work Hours"
}
```

### Error Responses

#### 400 Bad Request

Missing required fields:

```json
{
  "error": {
    "message": "Missing required field: assigneeId",
    "code": "MISSING_REQUIRED_FIELD"
  }
}
```

#### 422 Unprocessable Entity

Invalid frequency or parameters:

```json
{
  "error": {
    "message": "Invalid frequency: INVALID_FREQUENCY",
    "code": "INVALID_PARAMETER"
  }
}
```

## Recurring Task Examples

### 1. Daily Standup

```json
{
  "name": "Daily Standup",
  "frequency": "DAILY",
  "workspaceId": "workspace_123",
  "assigneeId": "user_456",
  "duration": 15,
  "priority": "HIGH",
  "idealTime": "09:00",
  "description": "Quick sync on daily progress"
}
```

### 2. Weekly Report (Every Friday)

```json
{
  "name": "Weekly Status Report",
  "frequency": "WEEKLY_FRIDAY",
  "workspaceId": "workspace_123",
  "assigneeId": "user_789",
  "duration": 60,
  "deadlineType": "HARD",
  "idealTime": "16:00",
  "description": "Compile and send weekly status update to leadership"
}
```

### 3. Monthly Review (First of Month)

```json
{
  "name": "Monthly Performance Review",
  "frequency": "MONTHLY_1",
  "workspaceId": "workspace_123",
  "assigneeId": "user_manager",
  "duration": 120,
  "priority": "HIGH",
  "projectId": "project_reviews",
  "startingOn": "2024-01-01"
}
```

### 4. Bi-Weekly 1-on-1 (Every Other Monday)

```json
{
  "name": "1-on-1 with Manager",
  "frequency": "WEEKLY_MONDAY",
  "workspaceId": "workspace_123",
  "assigneeId": "user_456",
  "duration": 30,
  "idealTime": "14:00",
  "description": "Bi-weekly check-in with manager",
  "labels": ["1on1", "meeting"]
}
```

### 5. End of Month Tasks

```json
{
  "name": "Month-End Financial Close",
  "frequency": "MONTHLY_LAST",
  "workspaceId": "workspace_finance",
  "assigneeId": "user_accountant",
  "duration": 240,
  "deadlineType": "HARD",
  "priority": "HIGH",
  "description": "Complete month-end financial closing procedures"
}
```

## Code Examples

### JavaScript

```javascript
async function createRecurringTask(taskData) {
  const response = await fetch(
    'https://api.usemotion.com/v1/recurring-tasks',
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(taskData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create recurring task: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const recurringTask = await createRecurringTask({
    name: 'Weekly Team Meeting',
    frequency: 'WEEKLY_MONDAY',
    workspaceId: 'workspace_123',
    assigneeId: 'user_456',
    duration: 60,
    priority: 'HIGH',
    idealTime: '10:00',
    description: 'Weekly team sync and planning session'
  });
  
  console.log(`Created recurring task: ${recurringTask.name} (${recurringTask.id})`);
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import json
import os

def create_recurring_task(task_data):
    url = "https://api.usemotion.com/v1/recurring-tasks"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=task_data)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    recurring_task = create_recurring_task({
        "name": "Weekly Team Meeting",
        "frequency": "WEEKLY_MONDAY",
        "workspaceId": "workspace_123",
        "assigneeId": "user_456",
        "duration": 60,
        "priority": "HIGH",
        "idealTime": "10:00",
        "description": "Weekly team sync and planning session"
    })
    
    print(f"Created recurring task: {recurring_task['name']} ({recurring_task['id']})")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Create Multiple Recurring Tasks

```javascript
async function setupTeamRecurringTasks(workspaceId, teamLeadId) {
  const recurringTasks = [
    {
      name: 'Daily Standup',
      frequency: 'DAILY',
      duration: 15,
      idealTime: '09:00',
      priority: 'HIGH'
    },
    {
      name: 'Weekly Planning',
      frequency: 'WEEKLY_MONDAY',
      duration: 60,
      idealTime: '10:00',
      priority: 'HIGH'
    },
    {
      name: 'Weekly Retrospective',
      frequency: 'WEEKLY_FRIDAY',
      duration: 45,
      idealTime: '16:00',
      priority: 'MEDIUM'
    }
  ];

  const results = [];
  
  for (const task of recurringTasks) {
    try {
      const created = await createRecurringTask({
        ...task,
        workspaceId,
        assigneeId: teamLeadId
      });
      results.push({ success: true, task: created });
    } catch (error) {
      results.push({ success: false, task: task.name, error: error.message });
    }
  }
  
  return results;
}

// Set up standard team recurring tasks
const results = await setupTeamRecurringTasks('workspace_123', 'user_456');
const successful = results.filter(r => r.success).length;
console.log(`Created ${successful} out of ${results.length} recurring tasks`);
```

## Important Notes

1. **Frequency Required**: You must specify a valid frequency pattern
2. **Assignee Required**: Every recurring task must have an assignee
3. **Auto-Scheduling**: Tasks are auto-scheduled if the assignee has it enabled
4. **Start Date**: If not specified, tasks start generating immediately
5. **Time Preferences**: idealTime is a preference, not a guarantee
6. **Duration**: Must be positive integer or "REMINDER"
7. **Labels**: New labels are created automatically if they don't exist
8. **Project Association**: Optional but helpful for organization
9. **Schedule Limitation**: Only "Work Hours" schedule is supported

## Best Practices

1. **Clear Names**: Use descriptive names indicating recurrence
2. **Appropriate Duration**: Set realistic time estimates
3. **Ideal Times**: Specify preferred times for predictable scheduling
4. **Priority Setting**: Use HIGH for critical recurring tasks
5. **Description**: Include instructions or context for recurring work
6. **Project Grouping**: Group related recurring tasks in projects