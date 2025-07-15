# List Workspaces

Retrieve a list of workspaces accessible to the authenticated user.

## Endpoint

```
GET /v1/workspaces
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| cursor | string | No | Pagination cursor from previous response |
| ids | array<string> | No | Array of workspace IDs to get expanded details |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
# Get all workspaces
curl -X GET https://api.usemotion.com/v1/workspaces \
  -H "X-API-Key: YOUR_API_KEY"

# Get specific workspaces with details
curl -X GET "https://api.usemotion.com/v1/workspaces?ids=workspace_123,workspace_456" \
  -H "X-API-Key: YOUR_API_KEY"

# With pagination
curl -X GET "https://api.usemotion.com/v1/workspaces?cursor=eyJza2lwIjoyNX0=" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns paginated workspace list:

```json
{
  "meta": {
    "nextCursor": "eyJza2lwIjoyNX0=",
    "pageSize": 25
  },
  "workspaces": [
    {
      "id": "workspace_123",
      "name": "Engineering Team",
      "teamId": "team_456",
      "type": "team",
      "labels": [
        { "name": "bug" },
        { "name": "feature" },
        { "name": "improvement" },
        { "name": "urgent" }
      ],
      "statuses": [
        {
          "name": "TODO",
          "isDefaultStatus": true,
          "isResolvedStatus": false
        },
        {
          "name": "In Progress",
          "isDefaultStatus": false,
          "isResolvedStatus": false
        },
        {
          "name": "Code Review",
          "isDefaultStatus": false,
          "isResolvedStatus": false
        },
        {
          "name": "Done",
          "isDefaultStatus": false,
          "isResolvedStatus": true
        },
        {
          "name": "Cancelled",
          "isDefaultStatus": false,
          "isResolvedStatus": true
        }
      ]
    },
    {
      "id": "workspace_789",
      "name": "Personal Tasks",
      "teamId": "team_personal",
      "type": "individual",
      "labels": [
        { "name": "personal" },
        { "name": "home" },
        { "name": "work" }
      ],
      "statuses": [
        {
          "name": "TODO",
          "isDefaultStatus": true,
          "isResolvedStatus": false
        },
        {
          "name": "Done",
          "isDefaultStatus": false,
          "isResolvedStatus": true
        }
      ]
    }
  ]
}
```

### Basic Response (without ids parameter)

When workspace IDs are not specified, returns minimal information:

```json
{
  "meta": {
    "nextCursor": null,
    "pageSize": 10
  },
  "workspaces": [
    {
      "id": "workspace_123",
      "name": "Engineering Team"
    },
    {
      "id": "workspace_789",
      "name": "Personal Tasks"
    }
  ]
}
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

## Code Examples

### JavaScript

```javascript
async function listWorkspaces(options = {}) {
  const params = new URLSearchParams();
  
  if (options.cursor) {
    params.append('cursor', options.cursor);
  }
  
  if (options.ids && options.ids.length > 0) {
    params.append('ids', options.ids.join(','));
  }
  
  const url = `https://api.usemotion.com/v1/workspaces${
    params.toString() ? '?' + params.toString() : ''
  }`;

  const response = await fetch(url, {
    headers: {
      'X-API-Key': process.env.MOTION_API_KEY
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list workspaces: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
// Get all workspaces
const allWorkspaces = await listWorkspaces();
console.log(`Found ${allWorkspaces.workspaces.length} workspaces`);

// Get specific workspaces with full details
const detailedWorkspaces = await listWorkspaces({
  ids: ['workspace_123', 'workspace_456']
});

detailedWorkspaces.workspaces.forEach(ws => {
  console.log(`\nWorkspace: ${ws.name} (${ws.type})`);
  console.log(`Labels: ${ws.labels.map(l => l.name).join(', ')}`);
  console.log(`Statuses: ${ws.statuses.map(s => s.name).join(', ')}`);
});
```

### Python

```python
import requests
import os

def list_workspaces(cursor=None, ids=None):
    url = "https://api.usemotion.com/v1/workspaces"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    params = {}
    if cursor:
        params["cursor"] = cursor
    if ids:
        params["ids"] = ",".join(ids)
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()

# Usage
# Get all workspaces
all_workspaces = list_workspaces()
print(f"Found {len(all_workspaces['workspaces'])} workspaces")

# Get specific workspaces with details
detailed = list_workspaces(ids=["workspace_123", "workspace_456"])
for ws in detailed["workspaces"]:
    print(f"\nWorkspace: {ws['name']} ({ws['type']})")
    if "labels" in ws:
        print(f"Labels: {', '.join(l['name'] for l in ws['labels'])}")
```

### Get All Workspaces with Pagination

```javascript
async function getAllWorkspaces() {
  const allWorkspaces = [];
  let cursor = null;

  do {
    const result = await listWorkspaces({ cursor });
    allWorkspaces.push(...result.workspaces);
    cursor = result.meta.nextCursor;
  } while (cursor);

  return allWorkspaces;
}

// Get complete workspace list
const workspaces = await getAllWorkspaces();
console.log(`Total workspaces: ${workspaces.length}`);
```

### Filter Workspaces by Type

```javascript
async function getWorkspacesByType(type) {
  const all = await getAllWorkspaces();
  
  // Get IDs of workspaces to get details
  const ids = all.map(ws => ws.id);
  
  // Get detailed information
  const detailed = await listWorkspaces({ ids });
  
  // Filter by type
  return detailed.workspaces.filter(ws => ws.type === type);
}

// Get only team workspaces
const teamWorkspaces = await getWorkspacesByType('team');
console.log(`Found ${teamWorkspaces.length} team workspaces`);

// Get only individual workspaces
const personalWorkspaces = await getWorkspacesByType('individual');
console.log(`Found ${personalWorkspaces.length} personal workspaces`);
```

### Workspace Selector Helper

```javascript
async function selectWorkspace(promptText = 'Select a workspace:') {
  const workspaces = await listWorkspaces();
  
  console.log(promptText);
  workspaces.workspaces.forEach((ws, index) => {
    console.log(`${index + 1}. ${ws.name}`);
  });
  
  // In a real application, get user input
  // For this example, return first workspace
  return workspaces.workspaces[0];
}

// Interactive workspace selection
const selected = await selectWorkspace();
console.log(`Selected: ${selected.name}`);
```

### Get Workspace Configuration

```javascript
async function getWorkspaceConfig(workspaceId) {
  const result = await listWorkspaces({ ids: [workspaceId] });
  
  if (result.workspaces.length === 0) {
    throw new Error('Workspace not found or no access');
  }
  
  const workspace = result.workspaces[0];
  
  return {
    id: workspace.id,
    name: workspace.name,
    type: workspace.type,
    defaultStatus: workspace.statuses.find(s => s.isDefaultStatus)?.name,
    resolvedStatuses: workspace.statuses
      .filter(s => s.isResolvedStatus)
      .map(s => s.name),
    activeStatuses: workspace.statuses
      .filter(s => !s.isResolvedStatus)
      .map(s => s.name),
    labelCount: workspace.labels.length,
    labels: workspace.labels.map(l => l.name)
  };
}

// Get configuration for specific workspace
const config = await getWorkspaceConfig('workspace_123');
console.log(`Workspace: ${config.name}`);
console.log(`Default status: ${config.defaultStatus}`);
console.log(`Active statuses: ${config.activeStatuses.join(', ')}`);
console.log(`${config.labelCount} labels available`);
```

## Response Details

### Basic Workspace Object

When `ids` parameter is not provided:
- **id**: Unique workspace identifier
- **name**: Workspace display name

### Detailed Workspace Object

When specific workspace IDs are requested:
- **id**: Unique workspace identifier
- **name**: Workspace display name
- **teamId**: Associated team identifier
- **type**: "team" or "individual"
- **labels**: Array of available labels
- **statuses**: Array of available statuses with metadata

### Pagination

- Results are paginated using cursor-based pagination
- Default page size is typically 25 items
- Use `nextCursor` to retrieve additional pages
- `nextCursor` is null when no more results

## Best Practices

1. **Cache Results**: Workspace configuration changes infrequently
2. **Request Details When Needed**: Use `ids` parameter only when you need full details
3. **Handle Pagination**: Always check for `nextCursor` when listing all workspaces
4. **Type Filtering**: Filter by workspace type after retrieval
5. **Error Handling**: Handle cases where user has no workspace access