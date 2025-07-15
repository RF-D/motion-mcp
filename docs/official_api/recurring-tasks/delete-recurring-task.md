# Delete Recurring Task

Delete a recurring task template. This stops future task generation but doesn't affect already-created task instances.

## Endpoint

```
DELETE /v1/recurring-tasks/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | The ID of the recurring task to delete |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X DELETE https://api.usemotion.com/v1/recurring-tasks/123 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (204 No Content)

The recurring task is successfully deleted. No response body is returned.

### Error Responses

#### 404 Not Found

Recurring task doesn't exist:

```json
{
  "error": {
    "message": "Recurring task not found",
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

Insufficient permissions:

```json
{
  "error": {
    "message": "You do not have permission to delete this recurring task",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function deleteRecurringTask(recurringTaskId) {
  const response = await fetch(
    `https://api.usemotion.com/v1/recurring-tasks/${recurringTaskId}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Recurring task not found');
    }
    const error = await response.json();
    throw new Error(`Failed to delete recurring task: ${error.error.message}`);
  }

  // Success - no content returned
  return true;
}

// Usage
try {
  await deleteRecurringTask(123);
  console.log('Recurring task deleted successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def delete_recurring_task(recurring_task_id):
    url = f"https://api.usemotion.com/v1/recurring-tasks/{recurring_task_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 204:
        return True
    elif response.status_code == 404:
        raise Exception("Recurring task not found")
    else:
        response.raise_for_status()

# Usage
try:
    delete_recurring_task(123)
    print("Recurring task deleted successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Delete with Confirmation

```javascript
async function deleteRecurringTaskWithConfirmation(workspaceId, recurringTaskId) {
  // First, get the recurring task details
  const result = await listRecurringTasks(workspaceId);
  const task = result.recurringTasks.find(t => t.id === recurringTaskId.toString());
  
  if (!task) {
    throw new Error('Recurring task not found');
  }
  
  console.log(`About to delete recurring task: ${task.name} (${task.frequency})`);
  
  // Delete the recurring task
  await deleteRecurringTask(recurringTaskId);
  
  return {
    deleted: true,
    taskName: task.name,
    frequency: task.frequency,
    assignee: task.assignee.name
  };
}

// Usage
try {
  const result = await deleteRecurringTaskWithConfirmation('workspace_123', 456);
  console.log(`Deleted: ${result.taskName} (${result.frequency})`);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Bulk Delete Recurring Tasks

```javascript
async function deleteMultipleRecurringTasks(recurringTaskIds) {
  const results = [];
  
  for (const id of recurringTaskIds) {
    try {
      await deleteRecurringTask(id);
      results.push({
        id,
        success: true
      });
    } catch (error) {
      results.push({
        id,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Delete multiple recurring tasks
const idsToDelete = [123, 456, 789];
const deleteResults = await deleteMultipleRecurringTasks(idsToDelete);

const successful = deleteResults.filter(r => r.success).length;
console.log(`Deleted ${successful} out of ${deleteResults.length} recurring tasks`);

// Show any errors
deleteResults.filter(r => !r.success).forEach(result => {
  console.error(`Failed to delete ${result.id}: ${result.error}`);
});
```

### Clean Up Recurring Tasks by Pattern

```javascript
async function cleanupRecurringTasksByName(workspaceId, namePattern) {
  // Get all recurring tasks
  const result = await listRecurringTasks(workspaceId);
  
  // Filter tasks matching the pattern
  const tasksToDelete = result.recurringTasks.filter(task =>
    task.name.toLowerCase().includes(namePattern.toLowerCase())
  );
  
  if (tasksToDelete.length === 0) {
    console.log('No matching recurring tasks found');
    return [];
  }
  
  console.log(`Found ${tasksToDelete.length} recurring tasks to delete:`);
  tasksToDelete.forEach(task => {
    console.log(`  - ${task.name} (${task.frequency})`);
  });
  
  // Delete the tasks
  const results = [];
  for (const task of tasksToDelete) {
    try {
      await deleteRecurringTask(parseInt(task.id));
      results.push({
        name: task.name,
        success: true
      });
    } catch (error) {
      results.push({
        name: task.name,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Clean up all test recurring tasks
const cleanupResults = await cleanupRecurringTasksByName('workspace_123', 'test');
```

## Important Notes

1. **No Undo**: Deletion is permanent and cannot be undone
2. **Existing Tasks Remain**: Already-generated task instances are not deleted
3. **Future Tasks Stop**: No new tasks will be generated after deletion
4. **ID Type**: The ID parameter must be an integer, not a string
5. **Permissions**: You must have appropriate permissions to delete the recurring task
6. **No Cascade**: Deleting doesn't affect the project or workspace

## What Happens When Deleted

When you delete a recurring task:

1. **Template Removed**: The recurring task template is permanently deleted
2. **Generation Stops**: No new task instances will be created
3. **Existing Tasks**: Previously generated tasks remain unchanged
4. **History Lost**: The recurring task configuration cannot be recovered
5. **Immediate Effect**: Deletion takes effect immediately

## Best Practices

1. **Verify Before Deleting**: Check the recurring task details before deletion
2. **Document Deletion**: Keep records of deleted recurring tasks
3. **Consider Alternatives**: Instead of deleting, consider modifying the task
4. **Check Dependencies**: Ensure no workflows depend on the recurring task
5. **Communicate Changes**: Notify affected team members before deletion

## Alternative Approaches

Instead of deleting, consider:
- Modifying the assignee to a placeholder user
- Changing the frequency to reduce task generation
- Moving to a different workspace
- Updating the task to be a reminder only