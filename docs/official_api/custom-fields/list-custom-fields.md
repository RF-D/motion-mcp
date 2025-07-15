# List Custom Fields

Get all custom fields defined in a workspace.

## Endpoint

```
GET /beta/workspaces/{workspaceId}/custom-fields
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspaceId | string | Yes | The workspace ID to get custom fields for |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET https://api.usemotion.com/beta/workspaces/workspace_123/custom-fields \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns an array of custom field definitions:

```json
[
  {
    "id": "field_001",
    "name": "Budget",
    "type": "number",
    "metadata": {
      "format": "formatted"
    }
  },
  {
    "id": "field_002",
    "name": "Client Name",
    "type": "text"
  },
  {
    "id": "field_003",
    "name": "Priority Level",
    "type": "select",
    "metadata": {
      "options": [
        {
          "id": "critical",
          "value": "Critical",
          "color": "red"
        },
        {
          "id": "high",
          "value": "High",
          "color": "orange"
        },
        {
          "id": "medium",
          "value": "Medium",
          "color": "yellow"
        },
        {
          "id": "low",
          "value": "Low",
          "color": "green"
        }
      ]
    }
  },
  {
    "id": "field_004",
    "name": "Due Date",
    "type": "date"
  },
  {
    "id": "field_005",
    "name": "Stakeholders",
    "type": "multiPerson"
  },
  {
    "id": "field_006",
    "name": "Is Billable",
    "type": "checkbox",
    "metadata": {
      "toggle": true
    }
  },
  {
    "id": "field_007",
    "name": "Project URL",
    "type": "url"
  },
  {
    "id": "field_008",
    "name": "Categories",
    "type": "multiSelect",
    "metadata": {
      "options": [
        {
          "id": "frontend",
          "value": "Frontend",
          "color": "blue"
        },
        {
          "id": "backend",
          "value": "Backend",
          "color": "purple"
        },
        {
          "id": "design",
          "value": "Design",
          "color": "pink"
        }
      ]
    }
  }
]
```

### Empty Response

If no custom fields are defined:

```json
[]
```

### Error Responses

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
async function listCustomFields(workspaceId) {
  const response = await fetch(
    `https://api.usemotion.com/beta/workspaces/${workspaceId}/custom-fields`,
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to list custom fields: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const customFields = await listCustomFields('workspace_123');
  
  console.log(`Found ${customFields.length} custom fields:`);
  customFields.forEach(field => {
    console.log(`- ${field.name} (${field.type})`);
    
    // Show additional metadata
    if (field.metadata?.options) {
      console.log(`  Options: ${field.metadata.options.map(o => o.value).join(', ')}`);
    }
    if (field.metadata?.format) {
      console.log(`  Format: ${field.metadata.format}`);
    }
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def list_custom_fields(workspace_id):
    url = f"https://api.usemotion.com/beta/workspaces/{workspace_id}/custom-fields"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    custom_fields = list_custom_fields("workspace_123")
    
    print(f"Found {len(custom_fields)} custom fields:")
    for field in custom_fields:
        print(f"- {field['name']} ({field['type']})")
        
        # Show metadata if present
        if 'metadata' in field:
            if 'options' in field['metadata']:
                options = [opt['value'] for opt in field['metadata']['options']]
                print(f"  Options: {', '.join(options)}")
                
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Group Fields by Type

```javascript
function groupFieldsByType(customFields) {
  const grouped = {};
  
  customFields.forEach(field => {
    if (!grouped[field.type]) {
      grouped[field.type] = [];
    }
    grouped[field.type].push(field);
  });
  
  return grouped;
}

// Group custom fields by type
const fields = await listCustomFields('workspace_123');
const grouped = groupFieldsByType(fields);

console.log('Custom fields by type:');
Object.entries(grouped).forEach(([type, fields]) => {
  console.log(`\n${type}:`);
  fields.forEach(field => {
    console.log(`  - ${field.name} (${field.id})`);
  });
});
```

### Find Field by Name

```javascript
async function findCustomFieldByName(workspaceId, fieldName) {
  const fields = await listCustomFields(workspaceId);
  return fields.find(field => field.name === fieldName);
}

// Find specific field
const budgetField = await findCustomFieldByName('workspace_123', 'Budget');
if (budgetField) {
  console.log(`Found field: ${budgetField.name} (${budgetField.id})`);
} else {
  console.log('Field not found');
}
```

### Get Field Configuration

```javascript
function getFieldConfiguration(field) {
  const config = {
    id: field.id,
    name: field.name,
    type: field.type,
    hasOptions: false,
    optionCount: 0,
    format: null,
    isToggle: false
  };
  
  if (field.metadata) {
    if (field.metadata.options) {
      config.hasOptions = true;
      config.optionCount = field.metadata.options.length;
    }
    if (field.metadata.format) {
      config.format = field.metadata.format;
    }
    if (field.metadata.toggle) {
      config.isToggle = true;
    }
  }
  
  return config;
}

// Analyze field configurations
const fields = await listCustomFields('workspace_123');
const configurations = fields.map(getFieldConfiguration);

configurations.forEach(config => {
  console.log(`${config.name}:`);
  console.log(`  Type: ${config.type}`);
  if (config.hasOptions) {
    console.log(`  Options: ${config.optionCount}`);
  }
  if (config.format) {
    console.log(`  Format: ${config.format}`);
  }
});
```

### Validate Field Exists

```javascript
async function validateFieldExists(workspaceId, fieldId) {
  const fields = await listCustomFields(workspaceId);
  const field = fields.find(f => f.id === fieldId);
  
  if (!field) {
    throw new Error(`Custom field ${fieldId} not found in workspace`);
  }
  
  return field;
}

// Validate before using field
try {
  const field = await validateFieldExists('workspace_123', 'field_001');
  console.log(`Valid field: ${field.name} (${field.type})`);
} catch (error) {
  console.error(error.message);
}
```

## Response Field Details

### Custom Field Object

- **id**: Unique identifier for the custom field
- **name**: Display name of the field
- **type**: Field type (text, number, select, etc.)
- **metadata**: Optional configuration for the field type

### Metadata Structure

Different field types support different metadata:

#### Select/MultiSelect Fields
```javascript
{
  "options": [
    {
      "id": "unique-option-id",
      "value": "Display Name",
      "color": "color-name"
    }
  ]
}
```

#### Number Fields
```javascript
{
  "format": "plain" | "formatted" | "percent"
}
```

#### Checkbox Fields
```javascript
{
  "toggle": true | false
}
```

## Notes

- Custom fields are workspace-specific
- Field names must be unique within a workspace
- The beta API endpoint may change in future versions
- Empty metadata objects are not included in the response
- Field order in the response is not guaranteed