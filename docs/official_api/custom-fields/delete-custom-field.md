# Delete Custom Field

Delete a custom field definition from a workspace. This removes the field and all associated values.

## Endpoint

```
DELETE /beta/workspaces/{workspaceId}/custom-fields/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspaceId | string | Yes | The workspace containing the custom field |
| id | string | Yes | The ID of the custom field to delete |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X DELETE https://api.usemotion.com/beta/workspaces/workspace_123/custom-fields/field_456 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (204 No Content)

The custom field is successfully deleted. No response body is returned.

### Error Responses

#### 404 Not Found

Custom field or workspace doesn't exist:

```json
{
  "error": {
    "message": "Custom field not found",
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
    "message": "You do not have permission to delete custom fields",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function deleteCustomField(workspaceId, fieldId) {
  const response = await fetch(
    `https://api.usemotion.com/beta/workspaces/${workspaceId}/custom-fields/${fieldId}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Custom field not found');
    }
    const error = await response.json();
    throw new Error(`Failed to delete custom field: ${error.error.message}`);
  }

  // Success - no content returned
  return true;
}

// Usage
try {
  await deleteCustomField('workspace_123', 'field_456');
  console.log('Custom field deleted successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def delete_custom_field(workspace_id, field_id):
    url = f"https://api.usemotion.com/beta/workspaces/{workspace_id}/custom-fields/{field_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 204:
        return True
    elif response.status_code == 404:
        raise Exception("Custom field not found")
    else:
        response.raise_for_status()

# Usage
try:
    delete_custom_field("workspace_123", "field_456")
    print("Custom field deleted successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Delete Field with Confirmation

```javascript
async function deleteFieldWithConfirmation(workspaceId, fieldId) {
  // First, get the field details
  const fields = await listCustomFields(workspaceId);
  const field = fields.find(f => f.id === fieldId);
  
  if (!field) {
    throw new Error('Field not found');
  }
  
  console.log(`About to delete field: ${field.name} (${field.type})`);
  console.log('Warning: This will remove all associated values from tasks and projects');
  
  // Delete the field
  await deleteCustomField(workspaceId, fieldId);
  
  return {
    deleted: true,
    fieldName: field.name,
    fieldType: field.type
  };
}

// Usage
try {
  const result = await deleteFieldWithConfirmation('workspace_123', 'field_789');
  console.log(`Deleted field: ${result.fieldName}`);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Bulk Delete Custom Fields

```javascript
async function deleteMultipleFields(workspaceId, fieldIds) {
  const results = [];
  
  for (const fieldId of fieldIds) {
    try {
      await deleteCustomField(workspaceId, fieldId);
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

// Delete multiple fields
const fieldsToDelete = ['field_123', 'field_456', 'field_789'];
const deleteResults = await deleteMultipleFields('workspace_123', fieldsToDelete);

const successful = deleteResults.filter(r => r.success).length;
console.log(`Deleted ${successful} out of ${deleteResults.length} fields`);

// Show any errors
deleteResults.filter(r => !r.success).forEach(result => {
  console.error(`Failed to delete ${result.fieldId}: ${result.error}`);
});
```

### Clean Up Unused Fields

```javascript
async function cleanupUnusedFields(workspaceId) {
  // This is a conceptual example - you'd need to implement
  // logic to determine which fields are unused
  
  const fields = await listCustomFields(workspaceId);
  const tasks = await listTasks({ workspaceId });
  const projects = await listProjects(workspaceId);
  
  // Find fields not used in any task or project
  const unusedFields = fields.filter(field => {
    const fieldUsedInTasks = tasks.some(task => 
      task.customFieldValues && field.name in task.customFieldValues
    );
    const fieldUsedInProjects = projects.some(project => 
      project.customFieldValues && field.name in project.customFieldValues
    );
    
    return !fieldUsedInTasks && !fieldUsedInProjects;
  });
  
  console.log(`Found ${unusedFields.length} unused fields`);
  
  // Delete unused fields
  for (const field of unusedFields) {
    try {
      await deleteCustomField(workspaceId, field.id);
      console.log(`Deleted unused field: ${field.name}`);
    } catch (error) {
      console.error(`Failed to delete ${field.name}: ${error.message}`);
    }
  }
}
```

## Important Considerations

### Data Loss Warning

Deleting a custom field:
1. **Permanently removes** the field definition
2. **Deletes all values** associated with the field across all tasks and projects
3. **Cannot be undone** - there is no recovery option
4. **Immediate effect** - deletion happens instantly

### Before Deleting

Consider these alternatives:
- Archive the data by exporting tasks/projects with custom field values
- Rename the field if it's being repurposed
- Keep the field but stop using it for new items

### Impact Analysis

```javascript
async function analyzeFieldDeletionImpact(workspaceId, fieldId) {
  const fields = await listCustomFields(workspaceId);
  const field = fields.find(f => f.id === fieldId);
  
  if (!field) {
    throw new Error('Field not found');
  }
  
  // Get all tasks and projects to count usage
  const tasks = await listTasks({ workspaceId });
  const projects = await listProjects(workspaceId);
  
  let affectedTasks = 0;
  let affectedProjects = 0;
  
  tasks.forEach(task => {
    if (task.customFieldValues && field.name in task.customFieldValues) {
      affectedTasks++;
    }
  });
  
  projects.forEach(project => {
    if (project.customFieldValues && field.name in project.customFieldValues) {
      affectedProjects++;
    }
  });
  
  return {
    fieldName: field.name,
    fieldType: field.type,
    affectedTasks,
    affectedProjects,
    totalAffected: affectedTasks + affectedProjects
  };
}

// Check impact before deletion
const impact = await analyzeFieldDeletionImpact('workspace_123', 'field_456');
console.log(`Deleting "${impact.fieldName}" will affect:`);
console.log(`- ${impact.affectedTasks} tasks`);
console.log(`- ${impact.affectedProjects} projects`);
console.log(`Total: ${impact.totalAffected} items will lose this field`);
```

## Best Practices

1. **Backup Data**: Export custom field values before deletion
2. **Verify Impact**: Check how many items use the field
3. **Communicate**: Inform team members before deleting shared fields
4. **Test First**: Try in a test workspace if possible
5. **Document**: Keep records of deleted fields and reasons

## Notes

- Deletion is permanent and immediate
- All associated values are lost
- No cascade warnings are provided
- Field IDs cannot be reused after deletion
- Consider archiving data before deletion