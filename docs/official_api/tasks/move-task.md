# Move Task

Move a task to a different workspace and optionally reassign it.

## Endpoint

```
PATCH /v1/tasks/{id}/move
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the task to move |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| workspaceId | string | Yes | Target workspace ID |
| assigneeId | string | No | New assignee ID (optional) |

### Example Request

```bash
curl -X PATCH https://api.usemotion.com/v1/tasks/task_123/move \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "workspace_789",
    "assigneeId": "user_456"
  }'
```

## Response

### Success Response (200 OK)

Returns the moved task object with updated workspace and assignee:

```json
{
  "id": "task_123",
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
    { "name": "finance" }
  ],
  "workspace": {
    "id": "workspace_789",
    "name": "Finance Team Workspace",
    "teamId": "team_789",
    "type": "team"
  },
  "assignees": [
    {
      "id": "user_456",
      "name": "Jane Smith",
      "email": "jane@example.com"
    }
  ],
  "updatedTime": "2024-12-15T16:00:00Z"
}
```

### Error Responses

#### 404 Not Found

Task or workspace doesn't exist:

```json
{
  "error": {
    "message": "Task not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

#### 400 Bad Request

Invalid workspace or assignee:

```json
{
  "error": {
    "message": "Invalid workspace ID",
    "code": "INVALID_PARAMETER"
  }
}
```

#### 403 Forbidden

Insufficient permissions:

```json
{
  "error": {
    "message": "You do not have access to the target workspace",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Use Cases

### 1. Move Task Between Teams

```json
{
  "workspaceId": "workspace_marketing"
}
```

### 2. Move and Reassign

```json
{
  "workspaceId": "workspace_engineering",
  "assigneeId": "user_developer_123"
}
```

### 3. Move to Personal Workspace

```json
{
  "workspaceId": "workspace_personal_456"
}
```

## Code Examples

### JavaScript

```javascript
async function moveTask(taskId, targetWorkspaceId, assigneeId = null) {
  const body = {
    workspaceId: targetWorkspaceId
  };
  
  if (assigneeId) {
    body.assigneeId = assigneeId;
  }

  const response = await fetch(
    `https://api.usemotion.com/v1/tasks/${taskId}/move`,
    {
      method: 'PATCH',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to move task: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
// Move task to different workspace
const movedTask = await moveTask(
  'task_123', 
  'workspace_789'
);

// Move and reassign
const movedAndReassigned = await moveTask(
  'task_456',
  'workspace_789',
  'user_new_assignee'
);
```

### Python

```python
import requests
import json

def move_task(task_id, workspace_id, assignee_id=None):
    url = f"https://api.usemotion.com/v1/tasks/{task_id}/move"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    data = {"workspaceId": workspace_id}
    if assignee_id:
        data["assigneeId"] = assignee_id
    
    response = requests.patch(url, headers=headers, json=data)
    response.raise_for_status()
    
    return response.json()

# Usage
# Move task to different workspace
moved_task = move_task("task_123", "workspace_789")

# Move and reassign
moved_and_reassigned = move_task(
    "task_456",
    "workspace_789", 
    "user_new_assignee"
)
```

### Bulk Move Tasks

```javascript
async function bulkMoveTasks(taskIds, targetWorkspaceId) {
  const results = [];
  
  for (const taskId of taskIds) {
    try {
      const movedTask = await moveTask(taskId, targetWorkspaceId);
      results.push({
        taskId,
        success: true,
        newWorkspace: movedTask.workspace.name
      });
    } catch (error) {
      results.push({
        taskId,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Move multiple tasks to a new workspace
const tasksToMove = ['task_1', 'task_2', 'task_3'];
const moveResults = await bulkMoveTasks(
  tasksToMove, 
  'workspace_new_team'
);
```

## Important Considerations

1. **Status Mapping**: Task status may change if the target workspace has different statuses
2. **Label Availability**: Labels may not transfer if they don't exist in the target workspace
3. **Project Association**: Moving a task may remove it from its current project
4. **Permissions Required**:
   - Access to the source workspace
   - Access to the target workspace
   - Permission to assign to the specified user (if provided)
5. **Scheduling Impact**: Moving tasks may affect scheduling, especially if assignee changes
6. **Custom Fields**: Custom field values may be lost if fields don't exist in target workspace
7. **Team Limits**: Ensure the target workspace hasn't reached its task limits

## Best Practices

1. **Check Workspace Access**: Verify you have access to both workspaces before moving
2. **Validate Assignee**: Ensure the assignee has access to the target workspace
3. **Preserve Context**: Consider copying important information before moving
4. **Batch Moves**: Group related tasks when moving between workspaces
5. **Update References**: Update any external references to the moved tasks