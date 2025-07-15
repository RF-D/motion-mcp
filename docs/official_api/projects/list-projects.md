# List Projects

Retrieve a list of all projects, optionally filtered by workspace.

## Endpoint

```
GET /v1/projects
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspaceId | string | No | Filter projects by workspace ID |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
# Get all projects
curl -X GET "https://api.usemotion.com/v1/projects" \
  -H "X-API-Key: YOUR_API_KEY"

# Get projects for specific workspace
curl -X GET "https://api.usemotion.com/v1/projects?workspaceId=workspace_123" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns an array of project objects:

```json
[
  {
    "id": "project_001",
    "name": "Q1 Marketing Campaign",
    "description": "<p>Marketing initiatives for Q1 2024</p>",
    "workspaceId": "workspace_marketing",
    "status": {
      "name": "In Progress",
      "isDefaultStatus": false,
      "isResolvedStatus": false
    },
    "createdTime": "2024-01-01T09:00:00Z",
    "updatedTime": "2024-12-15T14:30:00Z",
    "customFieldValues": {
      "Budget": {
        "type": "number",
        "value": 50000
      },
      "Priority": {
        "type": "select",
        "value": "High"
      }
    }
  },
  {
    "id": "project_002",
    "name": "Website Redesign",
    "description": "<p>Complete overhaul of company website</p>",
    "workspaceId": "workspace_engineering",
    "status": {
      "name": "Planning",
      "isDefaultStatus": true,
      "isResolvedStatus": false
    },
    "createdTime": "2024-01-15T10:00:00Z",
    "updatedTime": "2024-01-20T16:00:00Z",
    "customFieldValues": {}
  },
  {
    "id": "project_003",
    "name": "Customer Onboarding Improvement",
    "description": "<p>Streamline the customer onboarding process</p>",
    "workspaceId": "workspace_product",
    "status": {
      "name": "Completed",
      "isDefaultStatus": false,
      "isResolvedStatus": true
    },
    "createdTime": "2023-11-01T08:00:00Z",
    "updatedTime": "2024-01-10T17:00:00Z",
    "customFieldValues": {
      "Quarter": {
        "type": "text",
        "value": "Q4 2023"
      }
    }
  }
]
```

### Empty Result

```json
[]
```

### Error Responses

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

## Code Examples

### JavaScript

```javascript
async function listProjects(workspaceId = null) {
  const url = new URL('https://api.usemotion.com/v1/projects');
  if (workspaceId) {
    url.searchParams.append('workspaceId', workspaceId);
  }

  const response = await fetch(url, {
    headers: {
      'X-API-Key': process.env.MOTION_API_KEY
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list projects: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
// Get all projects
const allProjects = await listProjects();
console.log(`Found ${allProjects.length} projects`);

// Get projects for specific workspace
const workspaceProjects = await listProjects('workspace_123');
workspaceProjects.forEach(project => {
  console.log(`${project.name} - ${project.status.name}`);
});
```

### Python

```python
import requests
import os

def list_projects(workspace_id=None):
    url = "https://api.usemotion.com/v1/projects"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    params = {}
    if workspace_id:
        params["workspaceId"] = workspace_id
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()

# Usage
# Get all projects
all_projects = list_projects()
print(f"Found {len(all_projects)} projects")

# Get projects for specific workspace
workspace_projects = list_projects("workspace_123")
for project in workspace_projects:
    print(f"{project['name']} - {project['status']['name']}")
```

### Filter Active Projects

```javascript
async function getActiveProjects(workspaceId = null) {
  const projects = await listProjects(workspaceId);
  
  return projects.filter(project => 
    !project.status.isResolvedStatus
  );
}

// Get only active (non-completed) projects
const activeProjects = await getActiveProjects();
console.log(`${activeProjects.length} active projects`);
```

### Group Projects by Status

```javascript
async function groupProjectsByStatus() {
  const projects = await listProjects();
  
  const grouped = projects.reduce((acc, project) => {
    const status = project.status.name;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(project);
    return acc;
  }, {});
  
  return grouped;
}

// Usage
const projectsByStatus = await groupProjectsByStatus();
Object.entries(projectsByStatus).forEach(([status, projects]) => {
  console.log(`${status}: ${projects.length} projects`);
});
```

### Projects with Custom Fields

```javascript
async function getProjectsWithBudget() {
  const projects = await listProjects();
  
  return projects.filter(project => 
    project.customFieldValues?.Budget?.value > 0
  ).map(project => ({
    name: project.name,
    budget: project.customFieldValues.Budget.value,
    status: project.status.name
  }));
}

// Get projects with budget information
const budgetedProjects = await getProjectsWithBudget();
budgetedProjects.forEach(project => {
  console.log(`${project.name}: $${project.budget.toLocaleString()}`);
});
```

## Response Details

### Project Object Fields

- **id**: Unique identifier for the project
- **name**: Project name (required)
- **description**: HTML-formatted project description
- **workspaceId**: ID of the containing workspace
- **status**: Current project status with metadata
- **createdTime**: When the project was created
- **updatedTime**: Last modification timestamp
- **customFieldValues**: Key-value pairs of custom field data

### Status Object

- **name**: Display name of the status
- **isDefaultStatus**: Whether new projects start with this status
- **isResolvedStatus**: Whether this status indicates project completion

## Best Practices

1. **Cache Results**: Project lists don't change frequently, consider caching
2. **Filter by Workspace**: Use workspace filtering to reduce response size
3. **Check Status**: Use status flags to identify active vs completed projects
4. **Handle Empty Arrays**: Always handle the case of no projects
5. **Monitor Custom Fields**: Projects may have varying custom fields

## Notes

- Projects are returned in no guaranteed order
- No pagination is currently supported for project lists
- All projects accessible to the API key are returned
- Workspace filtering is done server-side for efficiency
- Custom field values may be null or missing if not set