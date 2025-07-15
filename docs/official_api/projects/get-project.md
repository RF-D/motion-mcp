# Get Project

Retrieve detailed information about a specific project.

## Endpoint

```
GET /v1/projects/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the project to retrieve |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET https://api.usemotion.com/v1/projects/project_123 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns the complete project object:

```json
{
  "id": "project_123",
  "name": "Q1 Marketing Campaign",
  "description": "<p>Marketing campaign for Q1 2024 focusing on:</p><ul><li>Social media outreach</li><li>Email marketing</li><li>Content creation</li></ul>",
  "workspaceId": "workspace_456",
  "status": {
    "name": "In Progress",
    "isDefaultStatus": false,
    "isResolvedStatus": false
  },
  "createdTime": "2024-01-01T09:00:00Z",
  "updatedTime": "2024-12-15T16:45:00Z",
  "customFieldValues": {
    "Budget": {
      "type": "number",
      "value": 50000
    },
    "Department": {
      "type": "select",
      "value": "Marketing"
    },
    "Project Manager": {
      "type": "person",
      "value": {
        "id": "user_789",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    },
    "Target Completion": {
      "type": "date",
      "value": "2024-03-31"
    }
  }
}
```

### Error Responses

#### 404 Not Found

Project doesn't exist:

```json
{
  "error": {
    "message": "Project not found",
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

No access to the project:

```json
{
  "error": {
    "message": "You do not have access to this project",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function getProject(projectId) {
  const response = await fetch(
    `https://api.usemotion.com/v1/projects/${projectId}`,
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get project: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const project = await getProject('project_123');
  console.log(`Project: ${project.name}`);
  console.log(`Status: ${project.status.name}`);
  console.log(`Workspace: ${project.workspaceId}`);
  
  // Check if completed
  if (project.status.isResolvedStatus) {
    console.log('Project is completed!');
  }
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import os

def get_project(project_id):
    url = f"https://api.usemotion.com/v1/projects/{project_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    project = get_project("project_123")
    print(f"Project: {project['name']}")
    print(f"Status: {project['status']['name']}")
    
    # Check custom fields
    if 'Budget' in project.get('customFieldValues', {}):
        budget = project['customFieldValues']['Budget']['value']
        print(f"Budget: ${budget:,.2f}")
        
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Get Project with Error Handling

```javascript
async function getProjectSafely(projectId) {
  try {
    const project = await getProject(projectId);
    return { success: true, project };
  } catch (error) {
    if (error.message.includes('not found')) {
      return { success: false, error: 'Project does not exist' };
    } else if (error.message.includes('Invalid API key')) {
      return { success: false, error: 'Authentication failed' };
    } else {
      return { success: false, error: error.message };
    }
  }
}

// Usage
const result = await getProjectSafely('project_123');
if (result.success) {
  console.log('Project found:', result.project.name);
} else {
  console.log('Error:', result.error);
}
```

### Display Project Summary

```javascript
function displayProjectSummary(project) {
  console.log('='.repeat(50));
  console.log(`Project: ${project.name}`);
  console.log('='.repeat(50));
  console.log(`ID: ${project.id}`);
  console.log(`Status: ${project.status.name}`);
  console.log(`Created: ${new Date(project.createdTime).toLocaleDateString()}`);
  console.log(`Updated: ${new Date(project.updatedTime).toLocaleDateString()}`);
  
  // Display description (strip HTML)
  const description = project.description
    .replace(/<[^>]*>/g, '')
    .trim();
  if (description) {
    console.log(`\nDescription:\n${description}`);
  }
  
  // Display custom fields
  const customFields = project.customFieldValues || {};
  if (Object.keys(customFields).length > 0) {
    console.log('\nCustom Fields:');
    Object.entries(customFields).forEach(([name, field]) => {
      let value = field.value;
      if (field.type === 'person' && value) {
        value = value.name;
      } else if (field.type === 'number' && value) {
        value = value.toLocaleString();
      }
      console.log(`  ${name}: ${value}`);
    });
  }
}

// Usage
const project = await getProject('project_123');
displayProjectSummary(project);
```

### Check Project Budget

```javascript
async function getProjectBudgetInfo(projectId) {
  const project = await getProject(projectId);
  
  const budgetField = project.customFieldValues?.Budget;
  if (!budgetField || budgetField.type !== 'number') {
    return {
      hasBudget: false,
      project: project.name
    };
  }
  
  return {
    hasBudget: true,
    project: project.name,
    budget: budgetField.value,
    status: project.status.name,
    isActive: !project.status.isResolvedStatus
  };
}

// Usage
const budgetInfo = await getProjectBudgetInfo('project_123');
if (budgetInfo.hasBudget) {
  console.log(`${budgetInfo.project}: $${budgetInfo.budget.toLocaleString()}`);
  if (budgetInfo.isActive) {
    console.log('Project is currently active');
  }
} else {
  console.log(`${budgetInfo.project} has no budget assigned`);
}
```

## Project Details

### Core Fields

- **id**: Unique project identifier
- **name**: Project name
- **description**: HTML-formatted description
- **workspaceId**: ID of the containing workspace

### Status Information

The status object provides important metadata:
- **name**: Human-readable status name
- **isDefaultStatus**: True if this is the default for new projects
- **isResolvedStatus**: True if this indicates project completion

### Timestamps

- **createdTime**: When the project was created (ISO 8601)
- **updatedTime**: Last modification time (ISO 8601)

### Custom Fields

Custom fields are returned in the `customFieldValues` object with:
- Field name as the key
- Value object containing `type` and `value`
- Types can include: text, number, date, select, person, etc.

## Best Practices

1. **Error Handling**: Always handle 404 errors for invalid project IDs
2. **Status Checking**: Use `isResolvedStatus` to determine if project is complete
3. **Custom Fields**: Check field type before processing values
4. **Caching**: Cache project data if accessed frequently
5. **Description Parsing**: Project descriptions are HTML, parse accordingly