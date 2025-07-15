# Add Custom Field to Task

Add or update a custom field value on a task.

## Endpoint

```
POST /beta/custom-field-values/task/{taskId}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | The ID of the task |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| customFieldInstanceId | string | Yes | The ID of the custom field |
| value | object | Yes | The value object with type and value |

### Value Object Structure

The value object must include:
- `type` - The field type (must match the custom field definition)
- `value` - The actual value (format depends on type)

### Example Request

```bash
curl -X POST https://api.usemotion.com/beta/custom-field-values/task/task_123 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customFieldInstanceId": "field_456",
    "value": {
      "type": "number",
      "value": 50000
    }
  }'
```

## Response

### Success Response (200 OK)

Returns confirmation of the added value:

```json
{
  "taskId": "task_123",
  "customFieldId": "field_456",
  "value": {
    "type": "number",
    "value": 50000
  }
}
```

### Error Responses

#### 400 Bad Request

Invalid value for field type:

```json
{
  "error": {
    "message": "Invalid value type. Expected 'number' but got 'text'",
    "code": "INVALID_PARAMETER"
  }
}
```

#### 404 Not Found

Task or custom field not found:

```json
{
  "error": {
    "message": "Task not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Value Examples by Field Type

### Text Field

```json
{
  "customFieldInstanceId": "field_text",
  "value": {
    "type": "text",
    "value": "Project Alpha Documentation"
  }
}
```

### Number Field

```json
{
  "customFieldInstanceId": "field_number",
  "value": {
    "type": "number",
    "value": 125000.50
  }
}
```

### Date Field

```json
{
  "customFieldInstanceId": "field_date",
  "value": {
    "type": "date",
    "value": "2024-12-31"
  }
}
```

### Select Field

```json
{
  "customFieldInstanceId": "field_select",
  "value": {
    "type": "select",
    "value": "high-priority"  // Option ID
  }
}
```

### Multi-Select Field

```json
{
  "customFieldInstanceId": "field_multiselect",
  "value": {
    "type": "multiSelect",
    "value": ["frontend", "backend", "api"]  // Array of option IDs
  }
}
```

### Person Field

```json
{
  "customFieldInstanceId": "field_person",
  "value": {
    "type": "person",
    "value": {
      "id": "user_789",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Multi-Person Field

```json
{
  "customFieldInstanceId": "field_multiperson",
  "value": {
    "type": "multiPerson",
    "value": [
      {
        "id": "user_123",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      {
        "id": "user_456",
        "name": "Bob Johnson",
        "email": "bob@example.com"
      }
    ]
  }
}
```

### Checkbox Field

```json
{
  "customFieldInstanceId": "field_checkbox",
  "value": {
    "type": "checkbox",
    "value": true
  }
}
```

### URL Field

```json
{
  "customFieldInstanceId": "field_url",
  "value": {
    "type": "url",
    "value": "https://docs.example.com/project"
  }
}
```

### Email Field

```json
{
  "customFieldInstanceId": "field_email",
  "value": {
    "type": "email",
    "value": "client@example.com"
  }
}
```

### Phone Field

```json
{
  "customFieldInstanceId": "field_phone",
  "value": {
    "type": "phone",
    "value": "+1-555-123-4567"
  }
}
```

### Related Task Field

```json
{
  "customFieldInstanceId": "field_related",
  "value": {
    "type": "relatedTo",
    "value": "task_999"  // Related task ID
  }
}
```

## Code Examples

### JavaScript

```javascript
async function addCustomFieldToTask(taskId, fieldId, value) {
  const response = await fetch(
    `https://api.usemotion.com/beta/custom-field-values/task/${taskId}`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        customFieldInstanceId: fieldId,
        value: value
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to add custom field: ${error.error.message}`);
  }

  return await response.json();
}

// Usage examples
// Add budget to task
await addCustomFieldToTask('task_123', 'field_budget', {
  type: 'number',
  value: 75000
});

// Add priority
await addCustomFieldToTask('task_123', 'field_priority', {
  type: 'select',
  value: 'high'
});

// Add multiple tags
await addCustomFieldToTask('task_123', 'field_tags', {
  type: 'multiSelect',
  value: ['urgent', 'client-request', 'frontend']
});
```

### Python

```python
import requests
import json
import os

def add_custom_field_to_task(task_id, field_id, value):
    url = f"https://api.usemotion.com/beta/custom-field-values/task/{task_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    data = {
        "customFieldInstanceId": field_id,
        "value": value
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    return response.json()

# Usage
# Add due date custom field
result = add_custom_field_to_task("task_123", "field_due_date", {
    "type": "date",
    "value": "2024-12-31"
})

print(f"Added custom field to task {result['taskId']}")
```

### Add Multiple Custom Fields

```javascript
async function addMultipleCustomFields(taskId, fields) {
  const results = [];
  
  for (const { fieldId, value } of fields) {
    try {
      const result = await addCustomFieldToTask(taskId, fieldId, value);
      results.push({ success: true, fieldId, result });
    } catch (error) {
      results.push({ success: false, fieldId, error: error.message });
    }
  }
  
  return results;
}

// Add multiple fields to a task
const fieldsToAdd = [
  {
    fieldId: 'field_budget',
    value: { type: 'number', value: 100000 }
  },
  {
    fieldId: 'field_status',
    value: { type: 'select', value: 'in-progress' }
  },
  {
    fieldId: 'field_manager',
    value: { 
      type: 'person', 
      value: { id: 'user_123', name: 'Jane Doe', email: 'jane@example.com' }
    }
  }
];

const results = await addMultipleCustomFields('task_456', fieldsToAdd);
console.log(`Added ${results.filter(r => r.success).length} fields successfully`);
```

### Field Value Builder

```javascript
class CustomFieldValueBuilder {
  static text(value) {
    return { type: 'text', value };
  }
  
  static number(value) {
    return { type: 'number', value };
  }
  
  static date(value) {
    return { type: 'date', value };
  }
  
  static select(optionId) {
    return { type: 'select', value: optionId };
  }
  
  static multiSelect(optionIds) {
    return { type: 'multiSelect', value: optionIds };
  }
  
  static person(user) {
    return { type: 'person', value: user };
  }
  
  static multiPerson(users) {
    return { type: 'multiPerson', value: users };
  }
  
  static checkbox(checked) {
    return { type: 'checkbox', value: checked };
  }
  
  static url(url) {
    return { type: 'url', value: url };
  }
  
  static email(email) {
    return { type: 'email', value: email };
  }
  
  static phone(phoneNumber) {
    return { type: 'phone', value: phoneNumber };
  }
  
  static relatedTask(taskId) {
    return { type: 'relatedTo', value: taskId };
  }
}

// Use builder for cleaner code
await addCustomFieldToTask(
  'task_789',
  'field_budget',
  CustomFieldValueBuilder.number(50000)
);

await addCustomFieldToTask(
  'task_789',
  'field_tags',
  CustomFieldValueBuilder.multiSelect(['urgent', 'backend'])
);
```

### Update Existing Field Value

To update an existing custom field value, use the same endpoint:

```javascript
// Initial value
await addCustomFieldToTask('task_123', 'field_budget', {
  type: 'number',
  value: 50000
});

// Update value
await addCustomFieldToTask('task_123', 'field_budget', {
  type: 'number',
  value: 75000  // New value
});
```

## Important Notes

1. **Type Matching**: The value type must match the field definition
2. **Field Validation**: Values are validated based on field type
3. **Updating Values**: Use the same endpoint to update existing values
4. **Null Values**: To clear a field, you need to use the delete endpoint
5. **Field Access**: Custom field must exist in the task's workspace

## Best Practices

1. **Validate Field Type**: Ensure value type matches field definition
2. **Check Field Exists**: Verify custom field exists before adding
3. **Handle Errors**: Gracefully handle type mismatches and validation errors
4. **Batch Operations**: Add multiple fields in sequence when needed
5. **User Validation**: Verify user IDs exist before adding person fields