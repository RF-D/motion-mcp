# List Recurring Tasks

Retrieve a list of recurring tasks for a specific workspace.

## Endpoint

```
GET /v1/recurring-tasks
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspaceId | string | Yes | The workspace ID to filter recurring tasks |
| cursor | string | No | Pagination cursor from previous response |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
# Get recurring tasks for a workspace
curl -X GET "https://api.usemotion.com/v1/recurring-tasks?workspaceId=workspace_123" \
  -H "X-API-Key: YOUR_API_KEY"

# With pagination
curl -X GET "https://api.usemotion.com/v1/recurring-tasks?workspaceId=workspace_123&cursor=eyJza2lwIjoyNX0=" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

```json
{
  "meta": {
    "nextCursor": "eyJza2lwIjoyNX0=",
    "pageSize": 25
  },
  "recurringTasks": [
    {
      "id": "recurring_001",
      "name": "Daily Standup",
      "frequency": "DAILY",
      "creator": {
        "id": "user_123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "assignee": {
        "id": "user_456",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "project": {
        "id": "project_789",
        "name": "Team Meetings",
        "description": "All recurring team meetings",
        "workspaceId": "workspace_123",
        "status": {
          "name": "Active",
          "isDefaultStatus": false,
          "isResolvedStatus": false
        },
        "customFieldValues": {}
      },
      "workspace": {
        "id": "workspace_123",
        "name": "Engineering Team",
        "teamId": "team_456",
        "type": "team",
        "labels": [
          { "name": "meeting" },
          { "name": "daily" }
        ],
        "statuses": [
          {
            "name": "TODO",
            "isDefaultStatus": true,
            "isResolvedStatus": false
          },
          {
            "name": "DONE",
            "isDefaultStatus": false,
            "isResolvedStatus": true
          }
        ]
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
      "startingOn": "2024-01-01",
      "idealTime": "09:00",
      "schedule": "Work Hours"
    },
    {
      "id": "recurring_002",
      "name": "Weekly Report",
      "frequency": "WEEKLY_FRIDAY",
      "creator": {
        "id": "user_789",
        "name": "Manager Bob",
        "email": "bob@example.com"
      },
      "assignee": {
        "id": "user_456",
        "name": "Jane Smith",
        "email": "jane@example.com"
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
      "priority": "MEDIUM",
      "labels": [
        { "name": "report" },
        { "name": "weekly" }
      ],
      "description": "Compile and send weekly status report",
      "duration": 60,
      "deadlineType": "HARD",
      "idealTime": "16:00",
      "schedule": "Work Hours"
    }
  ]
}
```

### Empty Result

```json
{
  "meta": {
    "nextCursor": null,
    "pageSize": 0
  },
  "recurringTasks": []
}
```

### Error Responses

#### 400 Bad Request

Missing required workspaceId:

```json
{
  "error": {
    "message": "Missing required parameter: workspaceId",
    "code": "MISSING_REQUIRED_FIELD"
  }
}
```

#### 404 Not Found

Invalid workspace:

```json
{
  "error": {
    "message": "Workspace not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function listRecurringTasks(workspaceId, cursor = null) {
  const params = new URLSearchParams({ workspaceId });
  if (cursor) params.append('cursor', cursor);

  const response = await fetch(
    `https://api.usemotion.com/v1/recurring-tasks?${params}`,
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list recurring tasks: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const result = await listRecurringTasks('workspace_123');
  console.log(`Found ${result.recurringTasks.length} recurring tasks`);
  
  result.recurringTasks.forEach(task => {
    console.log(`${task.name} - ${task.frequency} - Assigned to: ${task.assignee.name}`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def list_recurring_tasks(workspace_id, cursor=None):
    url = "https://api.usemotion.com/v1/recurring-tasks"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    params = {"workspaceId": workspace_id}
    if cursor:
        params["cursor"] = cursor
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    result = list_recurring_tasks("workspace_123")
    print(f"Found {len(result['recurringTasks'])} recurring tasks")
    
    for task in result['recurringTasks']:
        print(f"{task['name']} - {task['frequency']} - Assigned to: {task['assignee']['name']}")
        
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Get All Recurring Tasks with Pagination

```javascript
async function getAllRecurringTasks(workspaceId) {
  const allTasks = [];
  let cursor = null;

  do {
    const result = await listRecurringTasks(workspaceId, cursor);
    allTasks.push(...result.recurringTasks);
    cursor = result.meta.nextCursor;
  } while (cursor);

  return allTasks;
}

// Get all recurring tasks
const allRecurringTasks = await getAllRecurringTasks('workspace_123');
console.log(`Total recurring tasks: ${allRecurringTasks.length}`);
```

### Filter by Frequency

```javascript
function filterByFrequency(recurringTasks, frequency) {
  return recurringTasks.filter(task => 
    task.frequency === frequency
  );
}

// Get all recurring tasks and filter
const result = await listRecurringTasks('workspace_123');
const dailyTasks = filterByFrequency(result.recurringTasks, 'DAILY');
const weeklyTasks = filterByFrequency(result.recurringTasks, 'WEEKLY_FRIDAY');

console.log(`Daily tasks: ${dailyTasks.length}`);
console.log(`Weekly Friday tasks: ${weeklyTasks.length}`);
```

### Group by Assignee

```javascript
function groupByAssignee(recurringTasks) {
  return recurringTasks.reduce((groups, task) => {
    const assigneeName = task.assignee.name;
    if (!groups[assigneeName]) {
      groups[assigneeName] = [];
    }
    groups[assigneeName].push(task);
    return groups;
  }, {});
}

// Group recurring tasks by assignee
const result = await listRecurringTasks('workspace_123');
const tasksByAssignee = groupByAssignee(result.recurringTasks);

Object.entries(tasksByAssignee).forEach(([assignee, tasks]) => {
  console.log(`${assignee}: ${tasks.length} recurring tasks`);
  tasks.forEach(task => {
    console.log(`  - ${task.name} (${task.frequency})`);
  });
});
```

## Response Fields

### Recurring Task Object

- **id**: Unique identifier for the recurring task
- **name**: Task template name
- **frequency**: Recurrence pattern (DAILY, WEEKLY_*, MONTHLY_*, etc.)
- **creator**: User who created the recurring task
- **assignee**: User assigned to the recurring tasks
- **project**: Associated project (optional)
- **workspace**: Workspace containing the recurring task
- **status**: Default status for generated tasks
- **priority**: Task priority (HIGH, MEDIUM)
- **labels**: Array of labels for generated tasks
- **description**: Task description
- **duration**: Time duration in minutes or "REMINDER"
- **deadlineType**: "HARD" or "SOFT"
- **startingOn**: Date when recurring tasks start
- **idealTime**: Preferred time of day (HH:mm format)
- **schedule**: Schedule name (usually "Work Hours")

## Notes

- **Workspace Filter Required**: You must specify a workspaceId
- **Pagination**: Use cursor-based pagination for large result sets
- **Project Association**: Not all recurring tasks have associated projects
- **Frequency Patterns**: Common patterns include DAILY, WEEKLY_MONDAY through WEEKLY_SUNDAY, MONTHLY_1 through MONTHLY_31, MONTHLY_LAST
- **Generated Tasks**: This endpoint returns templates, not the generated task instances