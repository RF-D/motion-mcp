# Add Custom Field to Project

Add or update a custom field value on a project.

## Endpoint

```
POST /beta/custom-field-values/project/{projectId}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| projectId | string | Yes | The ID of the project |

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

### Example Request

```bash
curl -X POST https://api.usemotion.com/beta/custom-field-values/project/project_123 \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "customFieldInstanceId": "field_456",
    "value": {
      "type": "number",
      "value": 1000000
    }
  }'
```

## Response

### Success Response (200 OK)

Returns confirmation of the added value:

```json
{
  "projectId": "project_123",
  "customFieldId": "field_456",
  "value": {
    "type": "number",
    "value": 1000000
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

Project or custom field not found:

```json
{
  "error": {
    "message": "Project not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Project-Specific Field Examples

### Project Budget

```json
{
  "customFieldInstanceId": "field_budget",
  "value": {
    "type": "number",
    "value": 500000.00
  }
}
```

### Project Status

```json
{
  "customFieldInstanceId": "field_status",
  "value": {
    "type": "select",
    "value": "in-progress"  // Option ID
  }
}
```

### Project Manager

```json
{
  "customFieldInstanceId": "field_manager",
  "value": {
    "type": "person",
    "value": {
      "id": "user_123",
      "name": "Sarah Johnson",
      "email": "sarah@example.com"
    }
  }
}
```

### Project Timeline

```json
{
  "customFieldInstanceId": "field_start_date",
  "value": {
    "type": "date",
    "value": "2024-01-15"
  }
}
```

### Project Categories

```json
{
  "customFieldInstanceId": "field_categories",
  "value": {
    "type": "multiSelect",
    "value": ["web-development", "mobile", "api"]
  }
}
```

### Client Information

```json
{
  "customFieldInstanceId": "field_client_name",
  "value": {
    "type": "text",
    "value": "Acme Corporation"
  }
}
```

### Project Team

```json
{
  "customFieldInstanceId": "field_team_members",
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
      },
      {
        "id": "user_789",
        "name": "Alice Brown",
        "email": "alice@example.com"
      }
    ]
  }
}
```

## Code Examples

### JavaScript

```javascript
async function addCustomFieldToProject(projectId, fieldId, value) {
  const response = await fetch(
    `https://api.usemotion.com/beta/custom-field-values/project/${projectId}`,
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
// Add budget to project
await addCustomFieldToProject('project_123', 'field_budget', {
  type: 'number',
  value: 250000
});

// Add project phase
await addCustomFieldToProject('project_123', 'field_phase', {
  type: 'select',
  value: 'development'
});

// Add project team
await addCustomFieldToProject('project_123', 'field_team', {
  type: 'multiPerson',
  value: [
    { id: 'user_1', name: 'Developer 1', email: 'dev1@example.com' },
    { id: 'user_2', name: 'Developer 2', email: 'dev2@example.com' }
  ]
});
```

### Python

```python
import requests
import json
import os

def add_custom_field_to_project(project_id, field_id, value):
    url = f"https://api.usemotion.com/beta/custom-field-values/project/{project_id}"
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
# Add project deadline
result = add_custom_field_to_project("project_123", "field_deadline", {
    "type": "date",
    "value": "2024-12-31"
})

print(f"Added custom field to project {result['projectId']}")
```

### Project Setup Helper

```javascript
async function setupProjectCustomFields(projectId, projectData) {
  const fields = [
    {
      fieldId: 'field_budget',
      value: { type: 'number', value: projectData.budget }
    },
    {
      fieldId: 'field_start_date',
      value: { type: 'date', value: projectData.startDate }
    },
    {
      fieldId: 'field_end_date',
      value: { type: 'date', value: projectData.endDate }
    },
    {
      fieldId: 'field_client',
      value: { type: 'text', value: projectData.clientName }
    },
    {
      fieldId: 'field_status',
      value: { type: 'select', value: projectData.status || 'planning' }
    },
    {
      fieldId: 'field_manager',
      value: { type: 'person', value: projectData.manager }
    }
  ];

  const results = [];
  
  for (const { fieldId, value } of fields) {
    try {
      const result = await addCustomFieldToProject(projectId, fieldId, value);
      results.push({ success: true, fieldId });
      console.log(`✓ Added ${fieldId}`);
    } catch (error) {
      results.push({ success: false, fieldId, error: error.message });
      console.error(`✗ Failed ${fieldId}: ${error.message}`);
    }
  }
  
  return results;
}

// Set up a new project
const projectSetup = await setupProjectCustomFields('project_new', {
  budget: 100000,
  startDate: '2024-01-15',
  endDate: '2024-06-30',
  clientName: 'Acme Corp',
  status: 'active',
  manager: {
    id: 'user_pm',
    name: 'Project Manager',
    email: 'pm@example.com'
  }
});
```

### Financial Tracking

```javascript
async function updateProjectFinancials(projectId, financials) {
  const updates = [];
  
  // Update budget
  if (financials.budget !== undefined) {
    updates.push(
      addCustomFieldToProject(projectId, 'field_budget', {
        type: 'number',
        value: financials.budget
      })
    );
  }
  
  // Update spent amount
  if (financials.spent !== undefined) {
    updates.push(
      addCustomFieldToProject(projectId, 'field_spent', {
        type: 'number',
        value: financials.spent
      })
    );
  }
  
  // Update percentage complete
  if (financials.percentComplete !== undefined) {
    updates.push(
      addCustomFieldToProject(projectId, 'field_complete', {
        type: 'number',
        value: financials.percentComplete
      })
    );
  }
  
  // Update billing status
  if (financials.billable !== undefined) {
    updates.push(
      addCustomFieldToProject(projectId, 'field_billable', {
        type: 'checkbox',
        value: financials.billable
      })
    );
  }
  
  await Promise.all(updates);
  console.log('Project financials updated');
}

// Update project financial data
await updateProjectFinancials('project_123', {
  budget: 150000,
  spent: 75000,
  percentComplete: 50,
  billable: true
});
```

### Project Metadata Builder

```javascript
class ProjectFieldBuilder {
  constructor(projectId) {
    this.projectId = projectId;
    this.fields = [];
  }
  
  addBudget(amount) {
    this.fields.push({
      fieldId: 'field_budget',
      value: { type: 'number', value: amount }
    });
    return this;
  }
  
  addTimeline(startDate, endDate) {
    this.fields.push(
      {
        fieldId: 'field_start_date',
        value: { type: 'date', value: startDate }
      },
      {
        fieldId: 'field_end_date',
        value: { type: 'date', value: endDate }
      }
    );
    return this;
  }
  
  addClient(clientName, clientEmail) {
    this.fields.push(
      {
        fieldId: 'field_client_name',
        value: { type: 'text', value: clientName }
      },
      {
        fieldId: 'field_client_email',
        value: { type: 'email', value: clientEmail }
      }
    );
    return this;
  }
  
  addTags(tags) {
    this.fields.push({
      fieldId: 'field_tags',
      value: { type: 'multiSelect', value: tags }
    });
    return this;
  }
  
  async apply() {
    const results = [];
    for (const { fieldId, value } of this.fields) {
      results.push(
        await addCustomFieldToProject(this.projectId, fieldId, value)
      );
    }
    return results;
  }
}

// Use builder pattern
const builder = new ProjectFieldBuilder('project_456')
  .addBudget(200000)
  .addTimeline('2024-02-01', '2024-08-31')
  .addClient('BigCorp Inc', 'contact@bigcorp.com')
  .addTags(['enterprise', 'priority', 'q2-2024']);

await builder.apply();
```

## Use Cases

### 1. Project Portfolio Management

Track key metrics across all projects:

```javascript
async function updateProjectMetrics(projectId, metrics) {
  await addCustomFieldToProject(projectId, 'field_roi', {
    type: 'number',
    value: metrics.roi
  });
  
  await addCustomFieldToProject(projectId, 'field_risk_level', {
    type: 'select',
    value: metrics.riskLevel // 'low', 'medium', 'high'
  });
  
  await addCustomFieldToProject(projectId, 'field_health_score', {
    type: 'number',
    value: metrics.healthScore // 0-100
  });
}
```

### 2. Client Project Tracking

Maintain client-specific information:

```javascript
async function setupClientProject(projectId, clientData) {
  await addCustomFieldToProject(projectId, 'field_client_company', {
    type: 'text',
    value: clientData.company
  });
  
  await addCustomFieldToProject(projectId, 'field_contract_value', {
    type: 'number',
    value: clientData.contractValue
  });
  
  await addCustomFieldToProject(projectId, 'field_contract_url', {
    type: 'url',
    value: clientData.contractUrl
  });
}
```

## Notes

- Same endpoint structure as task custom fields
- Project must exist in a workspace with the custom field
- Values are validated against field type definitions
- Updates overwrite existing values
- Use the delete endpoint to remove values