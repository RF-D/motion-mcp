# Custom Fields API (Beta)

The Custom Fields API allows you to create and manage custom data fields for tasks and projects in Motion.

## Overview

Custom fields enable:
- Adding business-specific data to tasks and projects
- Creating structured data collection
- Building custom workflows
- Tracking additional metadata

**Note**: This API is in beta status. The base URL for all custom fields endpoints is:
```
https://api.usemotion.com/beta
```

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/beta/workspaces/{workspaceId}/custom-fields` | [List custom fields](./list-custom-fields.md) |
| POST | `/beta/workspaces/{workspaceId}/custom-fields` | [Create custom field](./create-custom-field.md) |
| DELETE | `/beta/workspaces/{workspaceId}/custom-fields/{id}` | [Delete custom field](./delete-custom-field.md) |
| POST | `/beta/custom-field-values/task/{taskId}` | [Add custom field to task](./add-to-task.md) |
| DELETE | `/beta/custom-field-values/task/{taskId}/custom-fields/{valueId}` | [Remove from task](./remove-from-task.md) |
| POST | `/beta/custom-field-values/project/{projectId}` | [Add custom field to project](./add-to-project.md) |
| DELETE | `/beta/custom-field-values/project/{projectId}/custom-fields/{valueId}` | [Remove from project](./remove-from-project.md) |

## Custom Field Types

Motion supports 12 custom field types:

### Text Fields
- **text** - Single line text input
- **url** - URL validation
- **email** - Email validation
- **phone** - Phone number

### Numeric & Date
- **number** - Numeric values with optional formatting
- **date** - Date picker (ISO 8601 format)

### Selection Fields
- **select** - Single selection from options
- **multiSelect** - Multiple selections
- **checkbox** - Boolean toggle

### Relationship Fields
- **person** - Single user selection
- **multiPerson** - Multiple user selection
- **relatedTo** - Link to another task

## Custom Field Value Structure

Custom field values follow a discriminated union pattern:

```javascript
// Text field
{
  type: "text",
  value: "Example text"
}

// Number field
{
  type: "number",
  value: 12345
}

// Select field
{
  type: "select",
  value: "option-id"
}

// Person field
{
  type: "person",
  value: {
    id: "user_123",
    name: "John Doe",
    email: "john@example.com"
  }
}

// Multi-select field
{
  type: "multiSelect",
  value: ["option-1", "option-2"]
}
```

## Common Use Cases

### 1. Project Budget Tracking

```javascript
// Create budget field
POST /beta/workspaces/{workspaceId}/custom-fields
{
  "name": "Budget",
  "type": "number",
  "metadata": {
    "format": "formatted"
  }
}

// Add to project
POST /beta/custom-field-values/project/{projectId}
{
  "customFieldInstanceId": "field_123",
  "value": {
    "type": "number",
    "value": 50000
  }
}
```

### 2. Task Priority Matrix

```javascript
// Create impact field
POST /beta/workspaces/{workspaceId}/custom-fields
{
  "name": "Business Impact",
  "type": "select",
  "metadata": {
    "options": [
      { "id": "high", "value": "High Impact", "color": "red" },
      { "id": "medium", "value": "Medium Impact", "color": "yellow" },
      { "id": "low", "value": "Low Impact", "color": "green" }
    ]
  }
}
```

### 3. Client Information

```javascript
// Create client contact field
POST /beta/workspaces/{workspaceId}/custom-fields
{
  "name": "Client Contact",
  "type": "person"
}

// Create client company field
POST /beta/workspaces/{workspaceId}/custom-fields
{
  "name": "Client Company",
  "type": "text"
}
```

## Working with Custom Fields

### Field Creation Process

1. Create the field definition in a workspace
2. Field becomes available for all tasks/projects in that workspace
3. Add field values to specific tasks or projects
4. Update values as needed

### Value Management

- Values are stored separately from field definitions
- Each task/project can have different values
- Values can be null/empty
- Values are accessed by field name in API responses

### Field Metadata

Some field types support additional configuration:

```javascript
// Number field with formatting
{
  "type": "number",
  "metadata": {
    "format": "plain" | "formatted" | "percent"
  }
}

// Select field with options
{
  "type": "select",
  "metadata": {
    "options": [
      {
        "id": "unique-id",
        "value": "Display Name",
        "color": "blue"
      }
    ]
  }
}

// Checkbox with toggle style
{
  "type": "checkbox",
  "metadata": {
    "toggle": true
  }
}
```

## Best Practices

1. **Plan Field Structure**: Design your custom fields schema before implementation
2. **Use Appropriate Types**: Choose the right field type for your data
3. **Consistent Naming**: Use clear, consistent field names
4. **Validate Input**: Ensure values match the field type requirements
5. **Handle Missing Fields**: Tasks/projects may not have all custom fields

## Limitations

- Custom fields are workspace-specific
- Field names must be unique within a workspace
- Some field types have specific validation requirements
- Beta API may have changes in future versions
- Field deletion removes all associated values

## Error Handling

Common errors when working with custom fields:
- Invalid field type
- Duplicate field names
- Type mismatch in values
- Missing required metadata
- Workspace access issues

## Related Resources

- [Tasks API](../tasks/) - Tasks can have custom field values
- [Projects API](../projects/) - Projects can have custom field values
- [Workspaces API](../workspaces/) - Custom fields belong to workspaces