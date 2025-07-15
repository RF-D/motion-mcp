# Delete Task

Permanently delete a task from Motion.

## Endpoint

```
DELETE /v1/tasks/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the task to delete |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X DELETE https://api.usemotion.com/v1/tasks/task_123 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (204 No Content)

The task is successfully deleted. No response body is returned.

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

#### 403 Forbidden

Insufficient permissions to delete the task:

```json
{
  "error": {
    "message": "You do not have permission to delete this task",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function deleteTask(taskId) {
  const response = await fetch(
    `https://api.usemotion.com/v1/tasks/${taskId}`,
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
    throw new Error(`Failed to delete task: ${error.error.message}`);
  }

  // Success - no content returned
  return true;
}

// Usage
try {
  await deleteTask('task_123');
  console.log('Task deleted successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def delete_task(task_id):
    url = f"https://api.usemotion.com/v1/tasks/{task_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 204:
        return True
    elif response.status_code == 404:
        raise Exception("Task not found")
    else:
        response.raise_for_status()

# Usage
try:
    delete_task("task_123")
    print("Task deleted successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Batch Delete Example

```javascript
async function deleteMultipleTasks(taskIds) {
  const results = [];
  
  for (const taskId of taskIds) {
    try {
      await deleteTask(taskId);
      results.push({ taskId, success: true });
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

// Usage
const taskIds = ['task_1', 'task_2', 'task_3'];
const deleteResults = await deleteMultipleTasks(taskIds);

deleteResults.forEach(result => {
  if (result.success) {
    console.log(`✓ Deleted task ${result.taskId}`);
  } else {
    console.log(`✗ Failed to delete ${result.taskId}: ${result.error}`);
  }
});
```

### Safe Delete with Confirmation

```javascript
async function safeDeleteTask(taskId) {
  // First, fetch the task to confirm it exists
  try {
    const task = await getTask(taskId);
    console.log(`About to delete: ${task.name}`);
    
    // Perform the deletion
    await deleteTask(taskId);
    return { success: true, deletedTask: task };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

## Important Notes

1. **Permanent Deletion**: Deleted tasks cannot be recovered
2. **No Undo**: There is no undo functionality for task deletion
3. **Permissions**: You must have appropriate permissions to delete the task
4. **Recurring Tasks**: Deleting a recurring task instance doesn't affect the recurring task template
5. **Associated Data**: Deleting a task also removes:
   - All comments on the task
   - Task history
   - Scheduling information
   - Custom field values
6. **Project Tasks**: Deleting a task removes it from its project
7. **No Cascade**: Deleting a task doesn't affect related tasks or projects

## Best Practices

1. **Confirm Before Deleting**: Always confirm the action with users before deletion
2. **Check Permissions**: Verify user has permission to delete before attempting
3. **Log Deletions**: Keep an audit log of deleted tasks for compliance
4. **Batch Carefully**: When batch deleting, handle errors gracefully
5. **Consider Archiving**: Instead of deleting, consider changing status to "Archived" or "Cancelled"