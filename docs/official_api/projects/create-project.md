# Create Project

Create a new project in Motion.

## Endpoint

```
POST /v1/projects
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
| name | string | Yes | Project name |
| workspaceId | string | Yes | ID of the workspace where the project will be created |
| description | string | No | Project description (supports HTML/Markdown) |
| status | string | No | Initial project status (must be valid for the workspace) |

### Example Request

```bash
curl -X POST https://api.usemotion.com/v1/projects \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Q2 Product Launch",
    "workspaceId": "workspace_123",
    "description": "Launch campaign for our new product line including marketing, sales enablement, and customer success initiatives",
    "status": "Planning"
  }'
```

## Response

### Success Response (201 Created)

Returns the created project object:

```json
{
  "id": "project_new_456",
  "name": "Q2 Product Launch",
  "description": "<p>Launch campaign for our new product line including marketing, sales enablement, and customer success initiatives</p>",
  "workspaceId": "workspace_123",
  "status": {
    "name": "Planning",
    "isDefaultStatus": true,
    "isResolvedStatus": false
  },
  "createdTime": "2024-12-15T17:00:00Z",
  "updatedTime": "2024-12-15T17:00:00Z",
  "customFieldValues": {}
}
```

### Error Responses

#### 400 Bad Request

Missing required fields or invalid data:

```json
{
  "error": {
    "message": "Missing required field: name",
    "code": "MISSING_REQUIRED_FIELD"
  }
}
```

#### 404 Not Found

Invalid workspace ID:

```json
{
  "error": {
    "message": "Workspace not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

#### 422 Unprocessable Entity

Invalid status for workspace:

```json
{
  "error": {
    "message": "Invalid status: 'InvalidStatus' is not a valid status for this workspace",
    "code": "INVALID_PARAMETER"
  }
}
```

## Project Creation Examples

### 1. Simple Project

```json
{
  "name": "Website Redesign",
  "workspaceId": "workspace_123"
}
```

### 2. Project with Description

```json
{
  "name": "Customer Feedback Analysis",
  "workspaceId": "workspace_456",
  "description": "Analyze Q4 customer feedback to identify improvement areas and prioritize feature requests"
}
```

### 3. Project with Initial Status

```json
{
  "name": "API Integration Phase 2",
  "workspaceId": "workspace_789",
  "description": "Implement additional third-party API integrations",
  "status": "In Progress"
}
```

### 4. Marketing Campaign Project

```json
{
  "name": "Black Friday 2024 Campaign",
  "workspaceId": "workspace_marketing",
  "description": "## Campaign Overview\n\n**Objectives:**\n- Increase sales by 40%\n- Acquire 10,000 new customers\n- Boost brand awareness\n\n**Channels:**\n- Email marketing\n- Social media\n- Paid advertising\n- Influencer partnerships"
}
```

### 5. Development Sprint Project

```json
{
  "name": "Sprint 15 - Authentication Improvements",
  "workspaceId": "workspace_engineering",
  "description": "### Sprint Goals\n1. Implement OAuth 2.0\n2. Add two-factor authentication\n3. Improve password reset flow\n4. Security audit and fixes",
  "status": "Planning"
}
```

## Code Examples

### JavaScript

```javascript
async function createProject(projectData) {
  const response = await fetch(
    'https://api.usemotion.com/v1/projects',
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create project: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const newProject = await createProject({
    name: 'Q2 Marketing Campaign',
    workspaceId: 'workspace_123',
    description: 'Marketing initiatives for Q2 2024',
    status: 'Planning'
  });
  
  console.log(`Created project: ${newProject.name} (${newProject.id})`);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Python

```python
import requests
import json
import os

def create_project(project_data):
    url = "https://api.usemotion.com/v1/projects"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=project_data)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    new_project = create_project({
        "name": "Q2 Marketing Campaign",
        "workspaceId": "workspace_123",
        "description": "Marketing initiatives for Q2 2024",
        "status": "Planning"
    })
    
    print(f"Created project: {new_project['name']} ({new_project['id']})")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Create Project with Validation

```javascript
async function createProjectWithValidation(name, workspaceId, options = {}) {
  // Validate required fields
  if (!name || !name.trim()) {
    throw new Error('Project name is required');
  }
  
  if (!workspaceId) {
    throw new Error('Workspace ID is required');
  }
  
  // Build project data
  const projectData = {
    name: name.trim(),
    workspaceId
  };
  
  // Add optional fields
  if (options.description) {
    projectData.description = options.description;
  }
  
  if (options.status) {
    projectData.status = options.status;
  }
  
  return await createProject(projectData);
}

// Usage
const project = await createProjectWithValidation(
  'New Feature Development',
  'workspace_123',
  {
    description: 'Develop and launch new product features',
    status: 'In Progress'
  }
);
```

### Batch Create Projects

```javascript
async function createMultipleProjects(projectsData) {
  const results = [];
  
  for (const data of projectsData) {
    try {
      const project = await createProject(data);
      results.push({
        success: true,
        project
      });
    } catch (error) {
      results.push({
        success: false,
        error: error.message,
        data
      });
    }
  }
  
  return results;
}

// Create multiple projects
const projectsToCreate = [
  {
    name: 'Q1 Initiatives',
    workspaceId: 'workspace_123'
  },
  {
    name: 'Q2 Initiatives',
    workspaceId: 'workspace_123'
  },
  {
    name: 'Q3 Initiatives',
    workspaceId: 'workspace_123'
  }
];

const results = await createMultipleProjects(projectsToCreate);
const successful = results.filter(r => r.success).length;
console.log(`Created ${successful} out of ${results.length} projects`);
```

## Important Notes

1. **Workspace Required**: Every project must belong to a workspace
2. **Name Uniqueness**: Project names don't need to be unique within a workspace
3. **Status Validation**: If provided, status must exist in the workspace
4. **Default Status**: If no status is provided, the workspace's default status is used
5. **Description Format**: Description supports Markdown which is converted to HTML
6. **Custom Fields**: Cannot be set during creation - use the custom fields API after creation
7. **No Project Hierarchy**: Projects cannot be nested or have parent projects

## Best Practices

1. **Descriptive Names**: Use clear, descriptive project names
2. **Add Context**: Include detailed descriptions for better understanding
3. **Status Strategy**: Set appropriate initial status based on project phase
4. **Validation**: Validate inputs before making API calls
5. **Error Handling**: Handle specific error cases (invalid workspace, status, etc.)
6. **Workspace Verification**: Ensure workspace exists and you have access before creating