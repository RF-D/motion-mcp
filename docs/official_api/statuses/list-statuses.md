# List Statuses

Get all available statuses, optionally filtered by workspace.

## Endpoint

```
GET /v1/statuses
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspaceId | string | No | Filter statuses by specific workspace |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
# Get all statuses across all workspaces
curl -X GET https://api.usemotion.com/v1/statuses \
  -H "X-API-Key: YOUR_API_KEY"

# Get statuses for specific workspace
curl -X GET "https://api.usemotion.com/v1/statuses?workspaceId=workspace_123" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns an array of status objects:

```json
[
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
    "name": "Blocked",
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
```

### Project Statuses Example

```json
[
  {
    "name": "Planning",
    "isDefaultStatus": true,
    "isResolvedStatus": false
  },
  {
    "name": "Active",
    "isDefaultStatus": false,
    "isResolvedStatus": false
  },
  {
    "name": "On Hold",
    "isDefaultStatus": false,
    "isResolvedStatus": false
  },
  {
    "name": "Completed",
    "isDefaultStatus": false,
    "isResolvedStatus": true
  },
  {
    "name": "Archived",
    "isDefaultStatus": false,
    "isResolvedStatus": true
  }
]
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
async function getStatuses(workspaceId = null) {
  const url = new URL('https://api.usemotion.com/v1/statuses');
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
    throw new Error(`Failed to get statuses: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  // Get all statuses
  const allStatuses = await getStatuses();
  console.log(`Found ${allStatuses.length} statuses`);
  
  // Get statuses for specific workspace
  const workspaceStatuses = await getStatuses('workspace_123');
  
  // Group by type
  const defaultStatus = workspaceStatuses.find(s => s.isDefaultStatus);
  const resolvedStatuses = workspaceStatuses.filter(s => s.isResolvedStatus);
  const activeStatuses = workspaceStatuses.filter(s => !s.isResolvedStatus);
  
  console.log(`Default: ${defaultStatus?.name}`);
  console.log(`Active statuses: ${activeStatuses.map(s => s.name).join(', ')}`);
  console.log(`Resolved statuses: ${resolvedStatuses.map(s => s.name).join(', ')}`);
  
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def get_statuses(workspace_id=None):
    url = "https://api.usemotion.com/v1/statuses"
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
try:
    # Get all statuses
    all_statuses = get_statuses()
    print(f"Found {len(all_statuses)} statuses")
    
    # Get statuses for specific workspace
    workspace_statuses = get_statuses("workspace_123")
    
    # Categorize statuses
    default_status = next((s for s in workspace_statuses if s.get('isDefaultStatus')), None)
    resolved_statuses = [s for s in workspace_statuses if s.get('isResolvedStatus')]
    active_statuses = [s for s in workspace_statuses if not s.get('isResolvedStatus')]
    
    if default_status:
        print(f"Default: {default_status['name']}")
    print(f"Active: {', '.join(s['name'] for s in active_statuses)}")
    print(f"Resolved: {', '.join(s['name'] for s in resolved_statuses)}")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Status Validation Helper

```javascript
async function validateStatus(workspaceId, statusName) {
  const statuses = await getStatuses(workspaceId);
  const validStatus = statuses.find(s => s.name === statusName);
  
  if (!validStatus) {
    const availableStatuses = statuses.map(s => s.name).join(', ');
    throw new Error(
      `Invalid status '${statusName}'. Available statuses: ${availableStatuses}`
    );
  }
  
  return validStatus;
}

// Validate before creating/updating task
try {
  const status = await validateStatus('workspace_123', 'In Progress');
  console.log(`Valid status: ${status.name}`);
  
  if (status.isResolvedStatus) {
    console.log('Warning: This is a resolved status');
  }
} catch (error) {
  console.error(error.message);
}
```

### Get Status Categories

```javascript
function categorizeStatuses(statuses) {
  return {
    default: statuses.find(s => s.isDefaultStatus),
    active: statuses.filter(s => !s.isResolvedStatus),
    resolved: statuses.filter(s => s.isResolvedStatus),
    all: statuses
  };
}

// Categorize workspace statuses
const statuses = await getStatuses('workspace_123');
const categories = categorizeStatuses(statuses);

console.log('Status Categories:');
console.log(`- Default: ${categories.default?.name || 'None'}`);
console.log(`- Active (${categories.active.length}): ${categories.active.map(s => s.name).join(', ')}`);
console.log(`- Resolved (${categories.resolved.length}): ${categories.resolved.map(s => s.name).join(', ')}`);
```

### Status Transition Validator

```javascript
function getValidTransitions(currentStatus, allStatuses) {
  const current = allStatuses.find(s => s.name === currentStatus);
  
  if (!current) {
    throw new Error(`Unknown status: ${currentStatus}`);
  }
  
  // Define transition rules
  if (current.isResolvedStatus) {
    // Can't transition from resolved status
    return [];
  }
  
  // Can transition to any other status
  return allStatuses.filter(s => s.name !== currentStatus);
}

// Check valid transitions
const statuses = await getStatuses('workspace_123');
const validTransitions = getValidTransitions('TODO', statuses);

console.log('Valid transitions from TODO:');
validTransitions.forEach(status => {
  const type = status.isResolvedStatus ? '(resolved)' : '(active)';
  console.log(`  - ${status.name} ${type}`);
});
```

## Response Fields

### Status Object

- **name**: Display name of the status (case-sensitive)
- **isDefaultStatus**: Boolean indicating if this is the default status for new items
- **isResolvedStatus**: Boolean indicating if this status represents completion

## Important Notes

1. **Case Sensitivity**: Status names are case-sensitive when used in API calls
2. **Workspace Specific**: Different workspaces may have different available statuses
3. **No Modification**: Statuses cannot be created or modified via API
4. **Single Default**: Only one status per workspace can be the default
5. **Multiple Resolved**: Multiple statuses can be marked as resolved

## Best Practices

1. **Cache Status Lists**: Statuses don't change frequently, so cache the results
2. **Validate Before Use**: Always validate status names before using in create/update operations
3. **Handle Missing Workspace**: When no workspace filter is provided, statuses from all accessible workspaces are returned
4. **Check Status Type**: Use `isResolvedStatus` to determine if a status indicates task completion
5. **Provide User Feedback**: Show available statuses to users when status is invalid