# Create Task

Create a new task in Motion.

## Endpoint

```
POST /v1/tasks
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
| name | string | Yes | Task title |
| workspaceId | string | Yes | ID of the workspace |
| dueDate | datetime | Conditional | ISO 8601 due date (required for scheduled tasks) |
| duration | string \| number | No | "NONE", "REMINDER", or minutes (default: "NONE") |
| status | string | No | Task status name |
| autoScheduled | object \| null | No | Auto-scheduling configuration |
| projectId | string | No | ID of the project |
| description | string | No | Task description in GitHub Flavored Markdown |
| priority | string | No | "ASAP", "HIGH", "MEDIUM", or "LOW" |
| labels | array<string> | No | Array of label names |
| assigneeId | string | No | ID of the assignee |

#### Auto-Scheduling Object

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| startDate | datetime | Yes | Earliest date to schedule |
| deadlineType | string | Yes | "HARD", "SOFT", or "NONE" |
| schedule | string | No | Schedule name (default: "Work Hours") |

### Example Request

```bash
curl -X POST https://api.usemotion.com/v1/tasks \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Review Q4 budget report",
    "workspaceId": "workspace_123",
    "dueDate": "2024-12-31T17:00:00Z",
    "duration": 60,
    "priority": "HIGH",
    "status": "TODO",
    "description": "Review and approve the Q4 budget report before the board meeting",
    "labels": ["finance", "q4-planning"],
    "assigneeId": "user_456",
    "projectId": "project_789",
    "autoScheduled": {
      "startDate": "2024-12-15T09:00:00Z",
      "deadlineType": "HARD",
      "schedule": "Work Hours"
    }
  }'
```

## Response

### Success Response (201 Created)

Returns the created task object:

```json
{
  "id": "task_new_123",
  "name": "Review Q4 budget report",
  "description": "<p>Review and approve the Q4 budget report before the board meeting</p>",
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
    { "name": "q4-planning" }
  ],
  "scheduledStart": "2024-12-30T14:00:00Z",
  "scheduledEnd": "2024-12-30T15:00:00Z",
  "schedulingIssue": false,
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
      "id": "user_456",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "creator": {
    "id": "user_123",
    "name": "Jane Smith",
    "email": "jane@example.com"
  },
  "createdTime": "2024-12-15T10:00:00Z",
  "updatedTime": "2024-12-15T10:00:00Z"
}
```

### Error Responses

#### 400 Bad Request

Invalid request data:

```json
{
  "error": {
    "message": "Missing required field: workspaceId",
    "code": "MISSING_REQUIRED_FIELD"
  }
}
```

#### 422 Unprocessable Entity

Validation error:

```json
{
  "error": {
    "message": "Invalid priority value. Must be one of: ASAP, HIGH, MEDIUM, LOW",
    "code": "INVALID_PARAMETER"
  }
}
```

## Task Creation Examples

### 1. Simple Task (No Scheduling)

```json
{
  "name": "Send follow-up email",
  "workspaceId": "workspace_123",
  "duration": "NONE"
}
```

### 2. Reminder Task

```json
{
  "name": "Team standup",
  "workspaceId": "workspace_123",
  "dueDate": "2024-12-20T09:00:00Z",
  "duration": "REMINDER"
}
```

### 3. Scheduled Task with Duration

```json
{
  "name": "Code review",
  "workspaceId": "workspace_123",
  "dueDate": "2024-12-20T17:00:00Z",
  "duration": 45,
  "priority": "MEDIUM",
  "assigneeId": "user_789"
}
```

### 4. Auto-Scheduled Task

```json
{
  "name": "Prepare presentation",
  "workspaceId": "workspace_123",
  "dueDate": "2024-12-25T17:00:00Z",
  "duration": 120,
  "autoScheduled": {
    "startDate": "2024-12-20T09:00:00Z",
    "deadlineType": "SOFT",
    "schedule": "Work Hours"
  },
  "priority": "HIGH",
  "description": "Create slides for the annual review presentation"
}
```

### 5. Task with Custom Fields

To add custom field values during creation, include them in the request:

```json
{
  "name": "Budget review",
  "workspaceId": "workspace_123",
  "dueDate": "2024-12-31T17:00:00Z",
  "duration": 60,
  "customFieldValues": {
    "Budget Amount": 50000,
    "Department": "Finance",
    "Approved": true
  }
}
```

## Code Examples

### JavaScript

```javascript
async function createTask(taskData) {
  const response = await fetch('https://api.usemotion.com/v1/tasks', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.MOTION_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(taskData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create task: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
const newTask = await createTask({
  name: 'Review Q4 budget',
  workspaceId: 'workspace_123',
  dueDate: '2024-12-31T17:00:00Z',
  duration: 60,
  priority: 'HIGH',
  autoScheduled: {
    startDate: '2024-12-15T09:00:00Z',
    deadlineType: 'HARD',
    schedule: 'Work Hours'
  }
});

console.log(`Created task: ${newTask.id}`);
```

### Python

```python
import requests
import json
from datetime import datetime, timedelta

def create_task(task_data):
    url = "https://api.usemotion.com/v1/tasks"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=task_data)
    response.raise_for_status()
    
    return response.json()

# Usage
new_task = create_task({
    "name": "Review Q4 budget",
    "workspaceId": "workspace_123",
    "dueDate": (datetime.now() + timedelta(days=7)).isoformat() + "Z",
    "duration": 60,
    "priority": "HIGH",
    "autoScheduled": {
        "startDate": datetime.now().isoformat() + "Z",
        "deadlineType": "HARD",
        "schedule": "Work Hours"
    }
})

print(f"Created task: {new_task['id']}")
```

## Important Notes

1. **Due Date Requirement**: If you specify a duration (other than "NONE"), you must provide a due date
2. **Auto-Scheduling**: The task's status must have auto-scheduling enabled for this feature to work
3. **Schedule Names**: When scheduling for another user, only "Work Hours" schedule is allowed
4. **Label Creation**: New labels are automatically created if they don't exist
5. **Status Validation**: The status must exist in the workspace
6. **Markdown Support**: Description supports GitHub Flavored Markdown
7. **Default Values**: 
   - Duration defaults to "NONE" if not specified
   - Priority defaults to "MEDIUM" if not specified
   - Status defaults to the workspace's default status