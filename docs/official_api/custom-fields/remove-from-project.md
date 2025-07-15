# Remove Custom Field from Project

Remove a custom field value from a project.

## Endpoint

```
DELETE /beta/custom-field-values/project/{projectId}/custom-fields/{valueId}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | The ID of the project |
| valueId | string | Yes | The ID of the custom field value to remove |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X DELETE https://api.usemotion.com/beta/custom-field-values/project/project_123/custom-fields/field_456 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (204 No Content)

The custom field value is successfully removed from the project. No response body is returned.

### Error Responses

#### 404 Not Found

Project or custom field value not found:

```json
{
  "error": {
    "message": "Custom field value not found on project",
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
async function removeCustomFieldFromProject(projectId, fieldId) {
  const response = await fetch(
    `https://api.usemotion.com/beta/custom-field-values/project/${projectId}/custom-fields/${fieldId}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Custom field value not found on project');
    }
    const error = await response.json();
    throw new Error(`Failed to remove custom field: ${error.error.message}`);
  }

  // Success - no content returned
  return true;
}

// Usage
try {
  await removeCustomFieldFromProject('project_123', 'field_456');
  console.log('Custom field removed from project successfully');
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def remove_custom_field_from_project(project_id, field_id):
    url = f"https://api.usemotion.com/beta/custom-field-values/project/{project_id}/custom-fields/{field_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.delete(url, headers=headers)
    
    if response.status_code == 204:
        return True
    elif response.status_code == 404:
        raise Exception("Custom field value not found on project")
    else:
        response.raise_for_status()

# Usage
try:
    remove_custom_field_from_project("project_123", "field_456")
    print("Custom field removed from project successfully")
except Exception as e:
    print(f"Error: {e}")
```

### Remove Multiple Fields from Project

```javascript
async function removeMultipleFieldsFromProject(projectId, fieldIds) {
  const results = [];
  
  for (const fieldId of fieldIds) {
    try {
      await removeCustomFieldFromProject(projectId, fieldId);
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

// Remove multiple fields
const fieldsToRemove = ['field_budget', 'field_timeline', 'field_client'];
const results = await removeMultipleFieldsFromProject('project_123', fieldsToRemove);

const successful = results.filter(r => r.success).length;
console.log(`Removed ${successful} out of ${results.length} fields from project`);
```

### Clear Project Custom Fields

```javascript
async function clearProjectCustomFields(projectId) {
  // Get project with custom fields
  const project = await getProject(projectId);
  
  if (!project.customFieldValues || Object.keys(project.customFieldValues).length === 0) {
    console.log('No custom fields to remove from project');
    return [];
  }
  
  // Get workspace custom fields to map names to IDs
  const customFields = await listCustomFields(project.workspaceId);
  const fieldMap = new Map(customFields.map(f => [f.name, f.id]));
  
  // Remove each custom field
  const results = [];
  for (const fieldName of Object.keys(project.customFieldValues)) {
    const fieldId = fieldMap.get(fieldName);
    if (fieldId) {
      try {
        await removeCustomFieldFromProject(projectId, fieldId);
        results.push({ fieldName, success: true });
        console.log(`✓ Removed ${fieldName}`);
      } catch (error) {
        results.push({ fieldName, success: false, error: error.message });
        console.error(`✗ Failed to remove ${fieldName}`);
      }
    }
  }
  
  return results;
}

// Clear all custom fields from a project
const cleared = await clearProjectCustomFields('project_123');
console.log(`Cleared ${cleared.filter(r => r.success).length} fields from project`);
```

### Project Closure Cleanup

```javascript
async function closeProject(projectId) {
  // Update project status
  await updateProject(projectId, {
    status: 'Completed'
  });
  
  // Remove time-sensitive fields
  const fieldsToRemove = [
    'field_deadline',
    'field_current_sprint',
    'field_active_tasks',
    'field_burn_rate'
  ];
  
  for (const fieldId of fieldsToRemove) {
    try {
      await removeCustomFieldFromProject(projectId, fieldId);
      console.log(`Removed ${fieldId} from closed project`);
    } catch (error) {
      // Field might not exist, which is okay
      if (!error.message.includes('not found')) {
        console.error(`Error removing ${fieldId}: ${error.message}`);
      }
    }
  }
  
  console.log('Project closed and cleaned up');
}

// Close and clean up a project
await closeProject('project_123');
```

### Archive Project Data

```javascript
async function archiveProjectCustomFields(projectId) {
  // Get current project data
  const project = await getProject(projectId);
  
  if (!project.customFieldValues) {
    console.log('No custom fields to archive');
    return null;
  }
  
  // Create archive record
  const archive = {
    projectId: project.id,
    projectName: project.name,
    archivedAt: new Date().toISOString(),
    customFieldValues: { ...project.customFieldValues }
  };
  
  // Save archive (implement your storage method)
  await saveToArchive(archive);
  
  // Get field IDs
  const customFields = await listCustomFields(project.workspaceId);
  const fieldMap = new Map(customFields.map(f => [f.name, f.id]));
  
  // Remove fields after archiving
  for (const fieldName of Object.keys(project.customFieldValues)) {
    const fieldId = fieldMap.get(fieldName);
    if (fieldId) {
      await removeCustomFieldFromProject(projectId, fieldId);
    }
  }
  
  console.log('Project custom fields archived and removed');
  return archive;
}
```

### Conditional Field Removal

```javascript
async function removeProjectFieldsByCondition(projectId, condition) {
  const project = await getProject(projectId);
  
  if (!project.customFieldValues) {
    return [];
  }
  
  const customFields = await listCustomFields(project.workspaceId);
  const fieldMap = new Map(customFields.map(f => [f.name, f.id]));
  const removed = [];
  
  for (const [fieldName, fieldValue] of Object.entries(project.customFieldValues)) {
    if (condition(fieldName, fieldValue)) {
      const fieldId = fieldMap.get(fieldName);
      if (fieldId) {
        try {
          await removeCustomFieldFromProject(projectId, fieldId);
          removed.push(fieldName);
        } catch (error) {
          console.error(`Failed to remove ${fieldName}: ${error.message}`);
        }
      }
    }
  }
  
  return removed;
}

// Remove all empty text fields
const removedFields = await removeProjectFieldsByCondition(
  'project_123',
  (name, value) => value.type === 'text' && (!value.value || value.value.trim() === '')
);

console.log(`Removed ${removedFields.length} empty fields`);

// Remove all zero-value number fields
const removedNumbers = await removeProjectFieldsByCondition(
  'project_123',
  (name, value) => value.type === 'number' && value.value === 0
);
```

## Use Cases

### 1. Project Phase Transitions

Remove phase-specific fields when moving between phases:

```javascript
async function transitionProjectPhase(projectId, fromPhase, toPhase) {
  const phaseFields = {
    planning: ['field_estimated_budget', 'field_proposal_url'],
    development: ['field_sprint_number', 'field_velocity'],
    testing: ['field_bug_count', 'field_test_coverage'],
    deployment: ['field_deployment_date', 'field_rollback_plan']
  };
  
  // Remove old phase fields
  const oldFields = phaseFields[fromPhase] || [];
  for (const fieldId of oldFields) {
    await removeCustomFieldFromProject(projectId, fieldId);
  }
  
  console.log(`Transitioned project from ${fromPhase} to ${toPhase}`);
}
```

### 2. Budget Reset

Clear financial fields for new fiscal period:

```javascript
async function resetProjectBudget(projectId) {
  const financialFields = [
    'field_spent_amount',
    'field_remaining_budget',
    'field_burn_rate',
    'field_cost_overrun'
  ];
  
  for (const fieldId of financialFields) {
    try {
      await removeCustomFieldFromProject(projectId, fieldId);
    } catch (error) {
      // Ignore if field doesn't exist
    }
  }
  
  console.log('Project financial fields reset');
}
```

### 3. Template Cleanup

Remove template-specific fields after project creation:

```javascript
async function cleanupTemplateFields(projectId) {
  const templateFields = [
    'field_template_name',
    'field_template_version',
    'field_copied_from'
  ];
  
  const results = await removeMultipleFieldsFromProject(projectId, templateFields);
  console.log('Template fields cleaned up');
  return results;
}
```

## Important Notes

1. **Field ID Required**: You need the custom field ID, not the name
2. **Immediate Deletion**: Removal happens instantly and cannot be undone
3. **No Value Returned**: The deleted value is not returned
4. **Silent Success**: 204 response has no body
5. **Project Remains**: Only the field value is removed

## Best Practices

1. **Archive Before Removal**: Consider saving field values before deletion
2. **Verify Field Exists**: Check if field is present before attempting removal
3. **Handle 404 Gracefully**: Field might already be removed
4. **Batch Operations**: Group multiple removals for efficiency
5. **Document Removals**: Keep audit trail of field deletions