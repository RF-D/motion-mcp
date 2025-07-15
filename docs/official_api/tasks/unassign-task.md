# Unassign Task

Remove the assignee from a task, making it unassigned.

## Endpoint

```
DELETE /v1/tasks/{id}/assignee
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the task to unassign |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X DELETE https://api.usemotion.com/v1/tasks/task_123/assignee \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (204 No Content)

The task is successfully unassigned. No response body is returned.

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

Task is already unassigned:

```json
{
  "error": {
    "message": "Task has no assignee",
    "code": "INVALID_REQUEST"
  }
}
```

#### 403 Forbidden

Insufficient permissions:

```json
{
  "error": {
    "message": "You do not have permission to modify this task",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function unassignTask(taskId) {
  const response = await fetch(
    `https://api.usemotion.com/v1/tasks/${taskId}/assignee`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Task not found');
    }
    const error = await response.json();
    throw new Error(`Failed to unassign task: ${error.error.message}`);
  }

  // Success - no content returned
  return true;
}

// Usage
try {
  await unassignTask('task_123');
  console.log('Task unassigned successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def unassign_task(task_id):
    url = f"https://api.usemotion.com/v1/tasks/{task_id}/assignee"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 204:
        return True
    elif response.status_code == 404:
        raise Exception("Task not found")
    else:
        error = response.json()
        raise Exception(f"Failed to unassign: {error['error']['message']}")

# Usage
try:
    unassign_task("task_123")
    print("Task unassigned successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Unassign with Verification

```javascript
async function unassignTaskWithVerification(taskId) {
  // First, get the task to check current assignee
  const task = await getTask(taskId);
  
  if (!task.assignees || task.assignees.length === 0) {
    console.log('Task is already unassigned');
    return { alreadyUnassigned: true };
  }
  
  const previousAssignee = task.assignees[0];
  
  // Unassign the task
  await unassignTask(taskId);
  
  return {
    alreadyUnassigned: false,
    previousAssignee: previousAssignee
  };
}

// Usage
const result = await unassignTaskWithVerification('task_123');
if (!result.alreadyUnassigned) {
  console.log(`Unassigned from ${result.previousAssignee.name}`);
}
```

### Bulk Unassign Tasks

```javascript
async function bulkUnassignTasks(taskIds) {
  const results = [];
  
  for (const taskId of taskIds) {
    try {
      await unassignTask(taskId);
      results.push({ 
        taskId, 
        success: true 
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

// Unassign multiple tasks
const tasksToUnassign = ['task_1', 'task_2', 'task_3'];
const results = await bulkUnassignTasks(tasksToUnassign);

// Report results
const successful = results.filter(r => r.success).length;
console.log(`Successfully unassigned ${successful} out of ${results.length} tasks`);
```

### Unassign Tasks by Assignee

```javascript
async function unassignTasksByUser(userId) {
  // First, get all tasks assigned to the user
  const response = await listTasks({ assigneeId: userId });
  const tasks = response.tasks;
  
  console.log(`Found ${tasks.length} tasks assigned to user ${userId}`);
  
  // Unassign each task
  const results = await bulkUnassignTasks(
    tasks.map(task => task.id)
  );
  
  return results;
}

// Unassign all tasks from a specific user
const unassignResults = await unassignTasksByUser('user_leaving_123');
```

## Use Cases

1. **Employee Departure**: Unassign all tasks when an employee leaves
2. **Task Queue**: Create unassigned tasks for team members to pick up
3. **Workload Balancing**: Temporarily unassign tasks for redistribution
4. **Task Templates**: Create unassigned template tasks to be assigned later

## Important Notes

1. **Scheduling Impact**: Unassigning a task removes it from Motion's scheduling
2. **No Partial Unassign**: Tasks can only have one assignee, so this removes all assignment
3. **Project Tasks**: Unassigning doesn't remove the task from its project
4. **Status Unchanged**: Task status remains the same after unassigning
5. **History Preserved**: Assignment history is maintained for audit purposes
6. **Re-assignment**: Use the Update Task endpoint to assign to a new user

## Alternative Approach

Instead of using this endpoint, you can also unassign a task by updating it with a null assignee:

```javascript
// Alternative: Update task with null assignee
await updateTask('task_123', {
  assigneeId: null
});
```

Both approaches achieve the same result.