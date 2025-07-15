# Remove Custom Field from Task

Remove a custom field value from a task.

## Endpoint

```
DELETE /beta/custom-field-values/task/{taskId}/custom-fields/{valueId}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | The ID of the task |
| valueId | string | Yes | The ID of the custom field value to remove |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X DELETE https://api.usemotion.com/beta/custom-field-values/task/task_123/custom-fields/field_456 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (204 No Content)

The custom field value is successfully removed from the task. No response body is returned.

### Error Responses

#### 404 Not Found

Task or custom field value not found:

```json
{
  "error": {
    "message": "Custom field value not found on task",
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
async function removeCustomFieldFromTask(taskId, fieldId) {
  const response = await fetch(
    `https://api.usemotion.com/beta/custom-field-values/task/${taskId}/custom-fields/${fieldId}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Custom field value not found on task');
    }
    const error = await response.json();
    throw new Error(`Failed to remove custom field: ${error.error.message}`);
  }

  // Success - no content returned
  return true;
}

// Usage
try {
  await removeCustomFieldFromTask('task_123', 'field_456');
  console.log('Custom field removed from task successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def remove_custom_field_from_task(task_id, field_id):
    url = f"https://api.usemotion.com/beta/custom-field-values/task/{task_id}/custom-fields/{field_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 204:
        return True
    elif response.status_code == 404:
        raise Exception("Custom field value not found on task")
    else:
        response.raise_for_status()

# Usage
try:
    remove_custom_field_from_task("task_123", "field_456")
    print("Custom field removed from task successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Remove Multiple Fields

```javascript
async function removeMultipleFieldsFromTask(taskId, fieldIds) {
  const results = [];
  
  for (const fieldId of fieldIds) {
    try {
      await removeCustomFieldFromTask(taskId, fieldId);
      results.push({
        fieldId,
        success: true
      });
    } catch (error) {
      results.push({
        fieldId,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Remove multiple fields from a task
const fieldsToRemove = ['field_123', 'field_456', 'field_789'];
const results = await removeMultipleFieldsFromTask('task_001', fieldsToRemove);

const successful = results.filter(r => r.success).length;
console.log(`Removed ${successful} out of ${results.length} fields`);
```

### Clear All Custom Fields

```javascript
async function clearAllCustomFields(taskId) {
  // First, get the task to see current custom fields
  const task = await getTask(taskId);
  
  if (!task.customFieldValues || Object.keys(task.customFieldValues).length === 0) {
    console.log('No custom fields to remove');
    return [];
  }
  
  // Get workspace custom fields to map names to IDs
  const customFields = await listCustomFields(task.workspace.id);
  const fieldMap = new Map(customFields.map(f => [f.name, f.id]));
  
  // Remove each custom field
  const results = [];
  for (const fieldName of Object.keys(task.customFieldValues)) {
    const fieldId = fieldMap.get(fieldName);
    if (fieldId) {
      try {
        await removeCustomFieldFromTask(taskId, fieldId);
        results.push({ fieldName, success: true });
      } catch (error) {
        results.push({ fieldName, success: false, error: error.message });
      }
    }
  }
  
  return results;
}

// Clear all custom fields from a task
const cleared = await clearAllCustomFields('task_123');
console.log(`Cleared ${cleared.filter(r => r.success).length} custom fields`);
```

### Conditional Field Removal

```javascript
async function removeFieldIfValue(taskId, fieldId, condition) {
  // Get current task data
  const task = await getTask(taskId);
  
  // Find the field value
  const customFields = await listCustomFields(task.workspace.id);
  const field = customFields.find(f => f.id === fieldId);
  
  if (!field || !task.customFieldValues[field.name]) {
    console.log('Field not found on task');
    return false;
  }
  
  const currentValue = task.customFieldValues[field.name];
  
  // Check condition
  if (condition(currentValue)) {
    await removeCustomFieldFromTask(taskId, fieldId);
    console.log(`Removed field ${field.name} based on condition`);
    return true;
  }
  
  console.log(`Field ${field.name} kept - condition not met`);
  return false;
}

// Remove budget field if it's zero
await removeFieldIfValue('task_123', 'field_budget', 
  value => value.type === 'number' && value.value === 0
);

// Remove date field if it's in the past
await removeFieldIfValue('task_123', 'field_deadline',
  value => value.type === 'date' && new Date(value.value) < new Date()
);
```

### Replace Field Value

To effectively "update" a field, remove and re-add:

```javascript
async function replaceCustomFieldValue(taskId, fieldId, newValue) {
  try {
    // Remove existing value
    await removeCustomFieldFromTask(taskId, fieldId);
  } catch (error) {
    // Field might not exist on task, which is okay
    if (!error.message.includes('not found')) {
      throw error;
    }
  }
  
  // Add new value
  await addCustomFieldToTask(taskId, fieldId, newValue);
  console.log('Field value replaced successfully');
}

// Replace a budget value
await replaceCustomFieldValue('task_123', 'field_budget', {
  type: 'number',
  value: 100000
});
```

## Use Cases

### 1. Clear Completed Task Fields

Remove certain fields when task is completed:

```javascript
async function cleanupCompletedTask(taskId) {
  const task = await getTask(taskId);
  
  if (task.completed) {
    // Remove time-sensitive fields
    await removeCustomFieldFromTask(taskId, 'field_deadline');
    await removeCustomFieldFromTask(taskId, 'field_reminder_date');
    console.log('Cleaned up completed task fields');
  }
}
```

### 2. Reset Task Fields

Clear fields when task status changes:

```javascript
async function resetTaskFields(taskId, newStatus) {
  if (newStatus === 'TODO') {
    // Clear progress-related fields
    await removeCustomFieldFromTask(taskId, 'field_completion_percentage');
    await removeCustomFieldFromTask(taskId, 'field_time_spent');
  }
}
```

### 3. Remove Invalid Data

Clean up fields with invalid or outdated data:

```javascript
async function removeInvalidUrls(taskId) {
  const task = await getTask(taskId);
  const urlField = task.customFieldValues?.['Project URL'];
  
  if (urlField && !isValidUrl(urlField.value)) {
    await removeCustomFieldFromTask(taskId, 'field_url');
    console.log('Removed invalid URL field');
  }
}
```

## Important Notes

1. **Field ID Required**: You need the custom field ID, not the name
2. **No Undo**: Removal is immediate and cannot be undone
3. **No Value Returned**: The actual value is not returned on deletion
4. **Silent Success**: 204 response has no body
5. **Task Still Exists**: Only the field value is removed, not the task

## Best Practices

1. **Verify Before Removal**: Check if field exists on task first
2. **Handle 404 Gracefully**: Field might already be removed
3. **Log Removals**: Keep audit trail of field removals
4. **Batch Carefully**: Remove multiple fields in sequence
5. **Consider Null Values**: Sometimes setting null is better than removing