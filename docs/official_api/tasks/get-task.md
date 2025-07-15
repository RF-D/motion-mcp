# Get Task

Retrieve a single task by its ID.

## Endpoint

```
GET /v1/tasks/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the task to fetch |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET https://api.usemotion.com/v1/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns the complete task object:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Review Q4 budget report",
  "description": "<p>Review and approve the Q4 budget report before the board meeting</p>",
  "duration": 60,
  "dueDate": "2024-12-31T17:00:00Z",
  "deadlineType": "HARD",
  "completed": false,
  "completedTime": null,
  "status": {
    "name": "In Progress",
    "isDefaultStatus": false,
    "isResolvedStatus": false
  },
  "priority": "HIGH",
  "labels": [
    { "name": "finance" },
    { "name": "q4-planning" }
  ],
  "scheduledStart": "2024-12-30T14:00:00Z",
  "scheduledEnd": "2024-12-30T15:00:00Z",
  "schedulingIssue": false,
  "workspace": {
    "id": "workspace_123",
    "name": "My Workspace",
    "teamId": "team_456",
    "type": "team",
    "labels": [
      { "name": "finance" },
      { "name": "marketing" }
    ],
    "statuses": [
      {
        "name": "Todo",
        "isDefaultStatus": true,
        "isResolvedStatus": false
      },
      {
        "name": "In Progress",
        "isDefaultStatus": false,
        "isResolvedStatus": false
      },
      {
        "name": "Done",
        "isDefaultStatus": false,
        "isResolvedStatus": true
      }
    ]
  },
  "project": {
    "id": "project_789",
    "name": "Q4 Planning",
    "description": "All Q4 planning activities",
    "workspaceId": "workspace_123",
    "status": {
      "name": "Active",
      "isDefaultStatus": false,
      "isResolvedStatus": false
    },
    "createdTime": "2024-10-01T09:00:00Z",
    "updatedTime": "2024-12-15T10:30:00Z"
  },
  "creator": {
    "id": "user_111",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "assignees": [
    {
      "id": "user_222",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "createdTime": "2024-12-01T09:00:00Z",
  "updatedTime": "2024-12-15T14:30:00Z",
  "chunks": [
    {
      "id": "chunk_001",
      "duration": 60,
      "scheduledStart": "2024-12-30T14:00:00Z",
      "scheduledEnd": "2024-12-30T15:00:00Z",
      "completedTime": null,
      "isFixed": false
    }
  ],
  "customFieldValues": {
    "Budget Amount": {
      "type": "number",
      "value": 50000
    },
    "Department": {
      "type": "select",
      "value": "Finance"
    }
  }
}
```

### Error Responses

#### 404 Not Found

Task with the specified ID doesn't exist:

```json
{
  "error": {
    "message": "Task not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

#### 401 Unauthorized

Invalid or missing API key:

```json
{
  "error": {
    "message": "Invalid API key",
    "code": "INVALID_API_KEY"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function getTask(taskId) {
  const response = await fetch(
    `https://api.usemotion.com/v1/tasks/${taskId}`,
    {
      method: 'GET',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to get task: ${response.statusText}`);
  }

  return await response.json();
}

// Usage
try {
  const task = await getTask('550e8400-e29b-41d4-a716-446655440000');
  console.log(`Task: ${task.name} - Due: ${task.dueDate}`);
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def get_task(task_id):
    url = f"https://api.usemotion.com/v1/tasks/{task_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    task = get_task("550e8400-e29b-41d4-a716-446655440000")
    print(f"Task: {task['name']} - Due: {task['dueDate']}")
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

## Notes

- The task object includes all relationships (workspace, project, assignees)
- Custom field values are returned as a record keyed by field name
- Scheduled times represent Motion's AI scheduling decisions
- The `chunks` array shows how Motion has broken down the task for scheduling