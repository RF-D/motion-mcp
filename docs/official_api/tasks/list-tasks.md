# List Tasks

Retrieve a paginated list of tasks with optional filtering.

## Endpoint

```
GET /v1/tasks
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| assigneeId | string | No | Filter tasks by assignee ID |
| cursor | string | No | Pagination cursor from previous response |
| includeAllStatuses | boolean | No | Include tasks with all statuses (default: false) |
| label | string | No | Filter by label name |
| name | string | No | Filter by task name (case-insensitive) |
| projectId | string | No | Filter by project ID |
| status | array<string> | No | Filter by specific status names |
| workspaceId | string | No | Filter by workspace ID |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Requests

#### Basic Request

```bash
curl -X GET "https://api.usemotion.com/v1/tasks" \
  -H "X-API-Key: YOUR_API_KEY"
```

#### With Filters

```bash
curl -X GET "https://api.usemotion.com/v1/tasks?assigneeId=user_123&status=TODO,IN_PROGRESS&label=urgent" \
  -H "X-API-Key: YOUR_API_KEY"
```

#### With Pagination

```bash
curl -X GET "https://api.usemotion.com/v1/tasks?cursor=eyJza2lwIjoyNX0=" \
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
  "tasks": [
    {
      "id": "task_001",
      "name": "Review Q4 budget report",
      "description": "<p>Review and approve the Q4 budget report</p>",
      "duration": 60,
      "dueDate": "2024-12-31T17:00:00Z",
      "deadlineType": "HARD",
      "completed": false,
      "status": {
        "name": "TODO",
        "isDefaultStatus": true,
        "isResolvedStatus": false
      },
      "priority": "HIGH",
      "labels": [
        { "name": "finance" },
        { "name": "urgent" }
      ],
      "workspace": {
        "id": "workspace_123",
        "name": "My Workspace",
        "teamId": "team_456",
        "type": "team"
      },
      "project": {
        "id": "project_789",
        "name": "Q4 Planning",
        "workspaceId": "workspace_123"
      },
      "assignees": [
        {
          "id": "user_123",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "createdTime": "2024-12-01T09:00:00Z",
      "updatedTime": "2024-12-15T14:30:00Z"
    },
    {
      "id": "task_002",
      "name": "Prepare annual presentation",
      "description": "<p>Create slides for annual review</p>",
      "duration": 120,
      "dueDate": "2024-12-28T17:00:00Z",
      "deadlineType": "SOFT",
      "completed": false,
      "status": {
        "name": "IN_PROGRESS",
        "isDefaultStatus": false,
        "isResolvedStatus": false
      },
      "priority": "MEDIUM",
      "labels": [
        { "name": "presentation" }
      ],
      "workspace": {
        "id": "workspace_123",
        "name": "My Workspace",
        "teamId": "team_456",
        "type": "team"
      },
      "assignees": [
        {
          "id": "user_123",
          "name": "John Doe",
          "email": "john@example.com"
        }
      ],
      "createdTime": "2024-12-10T10:00:00Z",
      "updatedTime": "2024-12-16T11:00:00Z"
    }
  ]
}
```

### Empty Result

```json
{
  "meta": {
    "nextCursor": null,
    "pageSize": 25
  },
  "tasks": []
}
```

### Error Responses

#### 400 Bad Request

Invalid query parameters:

```json
{
  "error": {
    "message": "Invalid status value",
    "code": "INVALID_PARAMETER"
  }
}
```

## Pagination

The API uses cursor-based pagination. To retrieve all tasks:

1. Make initial request without cursor
2. Use `meta.nextCursor` from response for next page
3. Continue until `nextCursor` is null

### Example Pagination Code

```javascript
async function getAllTasks(filters = {}) {
  const tasks = [];
  let cursor = null;
  
  do {
    const params = new URLSearchParams({
      ...filters,
      ...(cursor && { cursor })
    });
    
    const response = await fetch(
      `https://api.usemotion.com/v1/tasks?${params}`,
      {
        headers: {
          'X-API-Key': process.env.MOTION_API_KEY
        }
      }
    );
    
    const data = await response.json();
    tasks.push(...data.tasks);
    cursor = data.meta.nextCursor;
    
  } while (cursor);
  
  return tasks;
}
```

## Filtering Examples

### By Assignee

```
GET /v1/tasks?assigneeId=user_123
```

### By Multiple Statuses

```
GET /v1/tasks?status=TODO,IN_PROGRESS
```

### By Project and Label

```
GET /v1/tasks?projectId=project_789&label=urgent
```

### Search by Name

```
GET /v1/tasks?name=budget
```

This performs a case-insensitive search for tasks with "budget" in the name.

### Include All Statuses

By default, completed tasks may not be included. To get all tasks regardless of status:

```
GET /v1/tasks?includeAllStatuses=true
```

## Code Examples

### JavaScript with Filtering

```javascript
async function listTasks(options = {}) {
  const {
    assigneeId,
    projectId,
    status,
    label,
    name,
    workspaceId,
    includeAllStatuses
  } = options;

  const params = new URLSearchParams();
  
  if (assigneeId) params.append('assigneeId', assigneeId);
  if (projectId) params.append('projectId', projectId);
  if (status) status.forEach(s => params.append('status', s));
  if (label) params.append('label', label);
  if (name) params.append('name', name);
  if (workspaceId) params.append('workspaceId', workspaceId);
  if (includeAllStatuses) params.append('includeAllStatuses', 'true');

  const response = await fetch(
    `https://api.usemotion.com/v1/tasks?${params}`,
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to list tasks: ${response.statusText}`);
  }

  return await response.json();
}

// Usage
const urgentTasks = await listTasks({
  label: 'urgent',
  status: ['TODO', 'IN_PROGRESS']
});
```

### Python

```python
import requests
import os

def list_tasks(**filters):
    url = "https://api.usemotion.com/v1/tasks"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    # Handle array parameters
    params = {}
    for key, value in filters.items():
        if key == 'status' and isinstance(value, list):
            params['status'] = value
        else:
            params[key] = value
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()

# Usage
urgent_tasks = list_tasks(
    label='urgent',
    status=['TODO', 'IN_PROGRESS']
)

print(f"Found {len(urgent_tasks['tasks'])} urgent tasks")
```

## Notes

- Default page size is typically 25 tasks
- Filtering is cumulative (AND operation between different filters)
- Status filtering accepts multiple values (OR operation between statuses)
- The `name` filter performs partial, case-insensitive matching
- Empty filter results return an empty array, not an error