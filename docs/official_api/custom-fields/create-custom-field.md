# Create Custom Field

Create a new custom field definition in a workspace.

## Endpoint

```
POST /beta/workspaces/{workspaceId}/custom-fields
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| workspaceId | string | Yes | The workspace ID where the field will be created |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| type | string | Yes | Field type (see supported types below) |
| name | string | Yes | Display name for the field |
| metadata | object | No | Type-specific configuration |

### Supported Field Types

- `text` - Single line text
- `url` - URL with validation
- `date` - Date picker
- `person` - Single user selection
- `multiPerson` - Multiple user selection
- `phone` - Phone number
- `select` - Single selection from options
- `multiSelect` - Multiple selections
- `number` - Numeric value
- `email` - Email with validation
- `checkbox` - Boolean toggle
- `relatedTo` - Link to another task

### Example Request

```bash
curl -X POST https://api.usemotion.com/beta/workspaces/workspace_123/custom-fields \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Project Budget",
    "type": "number",
    "metadata": {
      "format": "formatted"
    }
  }'
```

## Response

### Success Response (201 Created)

Returns the created custom field:

```json
{
  "id": "field_new_123",
  "name": "Project Budget",
  "type": "number",
  "metadata": {
    "format": "formatted"
  }
}
```

### Error Responses

#### 400 Bad Request

Invalid field configuration:

```json
{
  "error": {
    "message": "Invalid field type: invalid_type",
    "code": "INVALID_PARAMETER"
  }
}
```

#### 409 Conflict

Duplicate field name:

```json
{
  "error": {
    "message": "A custom field with name 'Budget' already exists",
    "code": "RESOURCE_ALREADY_EXISTS"
  }
}
```

## Field Type Examples

### 1. Text Field

```json
{
  "name": "Client Name",
  "type": "text"
}
```

### 2. Number Field with Formatting

```json
{
  "name": "Budget",
  "type": "number",
  "metadata": {
    "format": "formatted"  // Options: "plain", "formatted", "percent"
  }
}
```

### 3. Select Field with Options

```json
{
  "name": "Priority",
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
}
```

### 4. Multi-Select Field

```json
{
  "name": "Tags",
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
        "id": "database",
        "value": "Database",
        "color": "teal"
      },
      {
        "id": "api",
        "value": "API",
        "color": "indigo"
      }
    ]
  }
}
```

### 5. Date Field

```json
{
  "name": "Contract End Date",
  "type": "date"
}
```

### 6. Person Field

```json
{
  "name": "Project Manager",
  "type": "person"
}
```

### 7. Multi-Person Field

```json
{
  "name": "Stakeholders",
  "type": "multiPerson"
}
```

### 8. Checkbox with Toggle Style

```json
{
  "name": "Is Billable",
  "type": "checkbox",
  "metadata": {
    "toggle": true
  }
}
```

### 9. URL Field

```json
{
  "name": "Documentation Link",
  "type": "url"
}
```

### 10. Email Field

```json
{
  "name": "Client Email",
  "type": "email"
}
```

## Code Examples

### JavaScript

```javascript
async function createCustomField(workspaceId, fieldConfig) {
  const response = await fetch(
    `https://api.usemotion.com/beta/workspaces/${workspaceId}/custom-fields`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(fieldConfig)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create custom field: ${error.error.message}`);
  }

  return await response.json();
}

// Usage examples
// Create a budget field
const budgetField = await createCustomField('workspace_123', {
  name: 'Budget',
  type: 'number',
  metadata: {
    format: 'formatted'
  }
});

// Create a priority select field
const priorityField = await createCustomField('workspace_123', {
  name: 'Priority Level',
  type: 'select',
  metadata: {
    options: [
      { id: 'p1', value: 'P1 - Critical', color: 'red' },
      { id: 'p2', value: 'P2 - High', color: 'orange' },
      { id: 'p3', value: 'P3 - Medium', color: 'yellow' },
      { id: 'p4', value: 'P4 - Low', color: 'green' }
    ]
  }
});

console.log(`Created fields: ${budgetField.name}, ${priorityField.name}`);
```

### Python

```python
import requests
import json
import os

def create_custom_field(workspace_id, field_config):
    url = f"https://api.usemotion.com/beta/workspaces/{workspace_id}/custom-fields"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    response = requests.post(url, headers=headers, json=field_config)
    response.raise_for_status()
    
    return response.json()

# Usage
# Create a department select field
department_field = create_custom_field("workspace_123", {
    "name": "Department",
    "type": "select",
    "metadata": {
        "options": [
            {"id": "eng", "value": "Engineering", "color": "blue"},
            {"id": "sales", "value": "Sales", "color": "green"},
            {"id": "marketing", "value": "Marketing", "color": "purple"},
            {"id": "support", "value": "Support", "color": "orange"}
        ]
    }
})

print(f"Created field: {department_field['name']} ({department_field['id']})")
```

### Create Multiple Fields

```javascript
async function createProjectFields(workspaceId) {
  const fields = [
    {
      name: 'Project Code',
      type: 'text'
    },
    {
      name: 'Budget',
      type: 'number',
      metadata: { format: 'formatted' }
    },
    {
      name: 'Start Date',
      type: 'date'
    },
    {
      name: 'End Date',
      type: 'date'
    },
    {
      name: 'Project Manager',
      type: 'person'
    },
    {
      name: 'Status',
      type: 'select',
      metadata: {
        options: [
          { id: 'planning', value: 'Planning', color: 'gray' },
          { id: 'active', value: 'Active', color: 'blue' },
          { id: 'on-hold', value: 'On Hold', color: 'yellow' },
          { id: 'completed', value: 'Completed', color: 'green' }
        ]
      }
    }
  ];

  const created = [];
  
  for (const field of fields) {
    try {
      const result = await createCustomField(workspaceId, field);
      created.push(result);
      console.log(`✓ Created field: ${result.name}`);
    } catch (error) {
      console.error(`✗ Failed to create ${field.name}: ${error.message}`);
    }
  }
  
  return created;
}

// Create standard project fields
const projectFields = await createProjectFields('workspace_123');
console.log(`Created ${projectFields.length} custom fields`);
```

### Field Builder Helper

```javascript
class CustomFieldBuilder {
  constructor(name, type) {
    this.field = { name, type };
  }
  
  withFormat(format) {
    if (!this.field.metadata) this.field.metadata = {};
    this.field.metadata.format = format;
    return this;
  }
  
  withOptions(options) {
    if (!this.field.metadata) this.field.metadata = {};
    this.field.metadata.options = options;
    return this;
  }
  
  withToggle(isToggle = true) {
    if (!this.field.metadata) this.field.metadata = {};
    this.field.metadata.toggle = isToggle;
    return this;
  }
  
  build() {
    return this.field;
  }
}

// Use builder pattern
const field = new CustomFieldBuilder('Revenue', 'number')
  .withFormat('formatted')
  .build();

const createdField = await createCustomField('workspace_123', field);
```

## Metadata Reference

### Number Field Formats

- `plain` - No formatting (e.g., 50000)
- `formatted` - Thousand separators (e.g., 50,000)
- `percent` - Percentage display (e.g., 50%)

### Select/MultiSelect Options

Each option requires:
- `id` - Unique identifier (string)
- `value` - Display text (string)
- `color` - Color name (string)

Available colors:
- `red`, `orange`, `yellow`, `green`, `teal`, `blue`, `indigo`, `purple`, `pink`, `gray`

### Checkbox Toggle

- `toggle: true` - Display as toggle switch
- `toggle: false` or omitted - Display as checkbox

## Best Practices

1. **Unique Names**: Ensure field names are unique within the workspace
2. **Meaningful IDs**: Use descriptive IDs for select options
3. **Color Coding**: Use consistent color schemes for option meanings
4. **Validation**: The API validates field types and metadata
5. **Error Handling**: Handle duplicate name errors gracefully

## Notes

- Field names must be unique within a workspace
- Once created, field types cannot be changed
- Field IDs are generated automatically
- Metadata requirements vary by field type
- Creating a field doesn't add it to existing tasks/projects