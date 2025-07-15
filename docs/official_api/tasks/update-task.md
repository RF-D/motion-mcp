# Update Task

Update an existing task's properties.

## Endpoint

```
PATCH /v1/tasks/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the task to update |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

All fields are optional - only include fields you want to update:

| Field | Type | Description |
|-------|------|-------------|
| name | string | Task title |
| workspaceId | string | ID of the workspace |
| dueDate | datetime | ISO 8601 due date |
| duration | string \| number | "NONE", "REMINDER", or minutes |
| status | string | Task status name |
| autoScheduled | object \| null | Auto-scheduling configuration |
| projectId | string | ID of the project |
| description | string | Task description in GitHub Flavored Markdown |
| priority | string | "ASAP", "HIGH", "MEDIUM", or "LOW" |
| labels | array<string> | Array of label names |
| assigneeId | string | ID of the assignee |

### Example Request

```bash
curl -X PATCH https://api.usemotion.com/v1/tasks/task_123 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Review Q4 budget report - URGENT",
    "priority": "ASAP",
    "dueDate": "2024-12-30T17:00:00Z",
    "labels": ["finance", "q4-planning", "urgent"]
  }'
```

## Response

### Success Response (200 OK)

Returns the updated task object:

```json
{
  "id": "task_123",
  "name": "Review Q4 budget report - URGENT",
  "description": "<p>Review and approve the Q4 budget report before the board meeting</p>",
  "duration": 60,
  "dueDate": "2024-12-30T17:00:00Z",
  "deadlineType": "HARD",
  "completed": false,
  "status": {
    "name": "TODO",
    "isDefaultStatus": true,
    "isResolvedStatus": false
  },
  "priority": "ASAP",
  "labels": [
    { "name": "finance" },
    { "name": "q4-planning" },
    { "name": "urgent" }
  ],
  "scheduledStart": "2024-12-29T09:00:00Z",
  "scheduledEnd": "2024-12-29T10:00:00Z",
  "schedulingIssue": false,
  "workspace": {
    "id": "workspace_123",
    "name": "My Workspace",
    "teamId": "team_456",
    "type": "team"
  },
  "updatedTime": "2024-12-15T15:30:00Z"
}
```

### Error Responses

#### 404 Not Found

Task doesn't exist:

```json
{
  "error": {
    "message": "Task not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

#### 400 Bad Request

Invalid update data:

```json
{
  "error": {
    "message": "Invalid status: INVALID_STATUS",
    "code": "INVALID_PARAMETER"
  }
}
```

## Update Examples

### 1. Update Priority and Due Date

```json
{
  "priority": "ASAP",
  "dueDate": "2024-12-25T17:00:00Z"
}
```

### 2. Change Status

```json
{
  "status": "IN_PROGRESS"
}
```

### 3. Update Assignment

```json
{
  "assigneeId": "user_789"
}
```

### 4. Move to Different Project

```json
{
  "projectId": "project_456"
}
```

### 5. Update Auto-Scheduling

```json
{
  "autoScheduled": {
    "startDate": "2024-12-20T09:00:00Z",
    "deadlineType": "SOFT",
    "schedule": "Work Hours"
  }
}
```

### 6. Remove Auto-Scheduling

```json
{
  "autoScheduled": null
}
```

### 7. Update Labels (Replace All)

```json
{
  "labels": ["new-label-1", "new-label-2"]
}
```

### 8. Clear Description

```json
{
  "description": ""
}
```

### 9. Update Custom Fields

Include custom field updates in the request:

```json
{
  "customFieldValues": {
    "Budget Amount": 75000,
    "Department": "Marketing"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function updateTask(taskId, updates) {
  const response = await fetch(
    `https://api.usemotion.com/v1/tasks/${taskId}`,
    {
      method: 'PATCH',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update task: ${error.error.message}`);
  }

  return await response.json();
}

// Usage examples
// Update priority
const updatedTask = await updateTask('task_123', {
  priority: 'ASAP'
});

// Update multiple fields
const updatedTask2 = await updateTask('task_456', {
  name: 'Updated task name',
  status: 'IN_PROGRESS',
  labels: ['updated', 'in-progress'],
  dueDate: '2024-12-28T17:00:00Z'
});
```

### Python

```python
import requests
import json

def update_task(task_id, updates):
    url = f"https://api.usemotion.com/v1/tasks/{task_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    response = requests.patch(url, headers=headers, json=updates)
    response.raise_for_status()
    
    return response.json()

# Usage
# Update priority
updated_task = update_task("task_123", {
    "priority": "ASAP"
})

# Update multiple fields
updated_task2 = update_task("task_456", {
    "name": "Updated task name",
    "status": "IN_PROGRESS",
    "labels": ["updated", "in-progress"],
    "dueDate": "2024-12-28T17:00:00Z"
})
```

### Batch Updates Example

```javascript
async function batchUpdateTasks(taskIds, updates) {
  const results = await Promise.all(
    taskIds.map(id => updateTask(id, updates))
  );
  return results;
}

// Update multiple tasks to high priority
const taskIds = ['task_1', 'task_2', 'task_3'];
const updatedTasks = await batchUpdateTasks(taskIds, {
  priority: 'HIGH',
  labels: ['batch-updated']
});
```

## Important Notes

1. **Partial Updates**: Only include fields you want to change
2. **Label Replacement**: Labels array replaces all existing labels
3. **Status Validation**: Status must exist in the workspace
4. **Auto-Scheduling**: Requires compatible task status
5. **Workspace Changes**: Changing workspace may affect available statuses and labels
6. **Scheduling Recalculation**: Updates may trigger Motion to recalculate scheduling
7. **Due Date Changes**: Changing due date affects scheduling priority
8. **Custom Fields**: Only include custom fields you want to update; others remain unchanged