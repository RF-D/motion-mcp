# Motion API Official Reference

> Last Updated: July 2025
> 
> This is a comprehensive reference for the Motion (usemotion.com) REST API v1.

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Base URL](#base-url)
4. [Rate Limiting](#rate-limiting)
5. [Request Format](#request-format)
6. [Response Format](#response-format)
7. [Error Handling](#error-handling)
8. [API Endpoints](#api-endpoints)
   - [Users](#users)
   - [Workspaces](#workspaces)
   - [Tasks](#tasks)
   - [Projects](#projects)
   - [Comments](#comments)
   - [Recurring Tasks](#recurring-tasks)
   - [Custom Fields](#custom-fields)
   - [Schedules](#schedules)
   - [Statuses](#statuses)
9. [Data Types](#data-types)
10. [Pagination](#pagination)
11. [Webhooks](#webhooks)
12. [Code Examples](#code-examples)
13. [SDKs and Libraries](#sdks-and-libraries)
14. [Best Practices](#best-practices)

## Overview

The Motion API provides programmatic access to Motion's task management, project management, and scheduling features. It enables developers to build custom integrations and automate workflows.

**Note**: The API is intended for advanced users. Most users should use Motion's desktop and mobile applications for everyday use.

### Key Features

- Full CRUD operations on tasks, projects, and comments
- Recurring task management
- Custom field support
- Workspace management
- Real-time scheduling access
- Comprehensive filtering and search capabilities

## Authentication

Motion uses API Key authentication for all API requests.

### Creating an API Key

1. Log into your Motion account at [app.usemotion.com](https://app.usemotion.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Give your key a descriptive name
5. Copy the key immediately - **it will only be shown once**

### Using the API Key

Include your API key in the `X-API-Key` header of all requests:

```http
X-API-Key: your-api-key-here
```

### Security Best Practices

- Store API keys securely (use environment variables)
- Never commit API keys to version control
- Rotate keys regularly
- Use separate keys for different environments
- Restrict key permissions when possible

## Base URL

All API requests should be made to:

```
https://api.usemotion.com/v1
```

## Rate Limiting

Motion implements rate limiting to ensure fair usage and system stability.

### Rate Limits by Plan

| Plan | Requests per Minute | Requests per Hour |
|------|-------------------|-------------------|
| Starter | 12 | 720 |
| Professional | 120 | 7,200 |
| Team | 120 | 7,200 |
| Enterprise | Custom | Custom |

### Rate Limit Implementation

- Uses a **sliding window** approach (rolling 60-second period)
- Limits apply per API key
- All endpoints count toward the same limit

### Rate Limit Headers

Every response includes rate limit information:

```http
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 118
X-RateLimit-Reset: 1625097600
```

- `X-RateLimit-Limit`: Total requests allowed per minute
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Unix timestamp when the window resets

### Handling Rate Limits

When rate limited, the API returns:

```http
HTTP/1.1 429 Too Many Requests
Content-Type: application/json
Retry-After: 30

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please retry after 30 seconds."
  }
}
```

## Request Format

### Headers

Required headers for all requests:

```http
Content-Type: application/json
X-API-Key: your-api-key-here
```

### Request Body

All POST and PUT requests should send JSON-encoded bodies:

```json
{
  "name": "Task name",
  "description": "Task description",
  "dueDate": "2025-07-15T10:00:00Z"
}
```

### Date/Time Format

All date/time values must use ISO 8601 format:

- Full datetime: `2025-07-15T10:00:00Z`
- Date only: `2025-07-15`
- With timezone: `2025-07-15T10:00:00-07:00`

## Response Format

### Success Response

```json
{
  "data": {
    "id": "task_123",
    "name": "Complete project",
    "status": "active",
    "createdAt": "2025-07-14T10:00:00Z"
  }
}
```

### List Response

```json
{
  "data": [
    {
      "id": "task_123",
      "name": "Task 1"
    },
    {
      "id": "task_124",
      "name": "Task 2"
    }
  ],
  "meta": {
    "hasMore": true,
    "cursor": "eyJpZCI6MTIzfQ=="
  }
}
```

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "name": ["Name is required"],
      "dueDate": ["Invalid date format"]
    }
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|------------|-------------|
| 200 | Success - Request completed successfully |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded with no response body |
| 400 | Bad Request - Invalid request parameters |
| 401 | Unauthorized - Missing or invalid API key |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource conflict (e.g., duplicate) |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Temporary server issue |

### Error Codes

Common error codes returned in the `error.code` field:

- `invalid_api_key` - API key is invalid or expired
- `insufficient_permissions` - API key lacks required permissions
- `resource_not_found` - Requested resource doesn't exist
- `validation_error` - Request validation failed
- `rate_limit_exceeded` - Rate limit exceeded
- `internal_error` - Internal server error

## API Endpoints

### Users

#### Get Current User

Returns information about the API key owner.

```http
GET /users/me
```

**Response:**

```json
{
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "admin",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

### Workspaces

#### List Workspaces

Get all workspaces accessible to the user.

```http
GET /workspaces
```

**Query Parameters:**

- `cursor` (string) - Pagination cursor
- `limit` (integer) - Number of results (1-100, default: 20)

**Response:**

```json
{
  "data": [
    {
      "id": "workspace_123",
      "name": "Marketing Team",
      "type": "team",
      "memberCount": 5,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "hasMore": false,
    "cursor": null
  }
}
```

### Tasks

#### Create Task

Create a new task.

```http
POST /tasks
```

**Request Body:**

```json
{
  "name": "Complete Q3 Report",
  "description": "Prepare and submit the Q3 financial report",
  "workspaceId": "workspace_123",
  "projectId": "project_456",
  "assigneeId": "user_789",
  "status": "TODO",
  "priority": "HIGH",
  "dueDate": "2025-07-30T17:00:00Z",
  "duration": 120,
  "labels": ["urgent", "finance"],
  "customFields": {
    "department": "Finance",
    "budget": 5000
  }
}
```

**Required Fields:**
- `name` (string) - Task name
- `workspaceId` (string) - Workspace ID

**Optional Fields:**
- `description` (string) - Task description
- `projectId` (string) - Project ID
- `assigneeId` (string) - User ID to assign
- `status` (string) - Task status (TODO, IN_PROGRESS, DONE, BLOCKED)
- `priority` (string) - Priority (LOW, MEDIUM, HIGH, URGENT)
- `dueDate` (string) - Due date in ISO 8601
- `duration` (integer) - Duration in minutes
- `labels` (array) - Array of label strings
- `customFields` (object) - Custom field values

**Response:**

```json
{
  "data": {
    "id": "task_999",
    "name": "Complete Q3 Report",
    "description": "Prepare and submit the Q3 financial report",
    "workspaceId": "workspace_123",
    "projectId": "project_456",
    "assignee": {
      "id": "user_789",
      "name": "Jane Smith",
      "email": "jane@example.com"
    },
    "status": "TODO",
    "priority": "HIGH",
    "dueDate": "2025-07-30T17:00:00Z",
    "duration": 120,
    "labels": ["urgent", "finance"],
    "customFields": {
      "department": "Finance",
      "budget": 5000
    },
    "createdAt": "2025-07-14T10:00:00Z",
    "updatedAt": "2025-07-14T10:00:00Z"
  }
}
```

#### List Tasks

Get all tasks with optional filtering.

```http
GET /tasks
```

**Query Parameters:**

- `workspaceId` (string) - Filter by workspace
- `projectId` (string) - Filter by project
- `assigneeId` (string) - Filter by assignee
- `status` (string) - Filter by status
- `priority` (string) - Filter by priority
- `label` (string) - Filter by label (can be used multiple times)
- `dueBefore` (string) - Tasks due before date
- `dueAfter` (string) - Tasks due after date
- `createdBefore` (string) - Tasks created before date
- `createdAfter` (string) - Tasks created after date
- `updatedBefore` (string) - Tasks updated before date
- `updatedAfter` (string) - Tasks updated after date
- `includeCompleted` (boolean) - Include completed tasks (default: false)
- `cursor` (string) - Pagination cursor
- `limit` (integer) - Number of results (1-100, default: 20)

**Response:**

```json
{
  "data": [
    {
      "id": "task_123",
      "name": "Task 1",
      "status": "IN_PROGRESS",
      "assignee": {
        "id": "user_123",
        "name": "John Doe"
      },
      "dueDate": "2025-07-15T10:00:00Z",
      "priority": "MEDIUM"
    }
  ],
  "meta": {
    "hasMore": true,
    "cursor": "eyJpZCI6MTIzfQ=="
  }
}
```

#### Get Task

Get a specific task by ID.

```http
GET /tasks/{taskId}
```

**Response:**

Returns the full task object as shown in Create Task response.

#### Update Task

Update an existing task.

```http
PUT /tasks/{taskId}
```

**Request Body:**

Any fields from Create Task can be updated. Only include fields you want to change.

```json
{
  "name": "Updated Task Name",
  "status": "IN_PROGRESS",
  "priority": "URGENT"
}
```

**Response:**

Returns the updated task object.

#### Delete Task

Delete a task permanently.

```http
DELETE /tasks/{taskId}
```

**Response:**

```http
HTTP/1.1 204 No Content
```

#### Move Task

Move a task to another workspace.

```http
POST /tasks/{taskId}/move
```

**Request Body:**

```json
{
  "workspaceId": "workspace_456"
}
```

**Note:** When moving tasks between workspaces, the following are reset:
- Project assignment
- Status
- Labels
- Assignee

**Response:**

Returns the updated task object.

#### Unassign Task

Remove assignee from a task.

```http
POST /tasks/{taskId}/unassign
```

**Response:**

Returns the updated task object with `assignee` set to `null`.

### Projects

#### Create Project

Create a new project.

```http
POST /projects
```

**Request Body:**

```json
{
  "name": "Q3 Marketing Campaign",
  "description": "Launch new product marketing campaign",
  "workspaceId": "workspace_123",
  "color": "#FF6B6B",
  "status": "ACTIVE",
  "startDate": "2025-07-01",
  "endDate": "2025-09-30",
  "budget": 50000,
  "customFields": {
    "department": "Marketing",
    "manager": "Sarah Johnson"
  }
}
```

**Required Fields:**
- `name` (string) - Project name
- `workspaceId` (string) - Workspace ID

**Optional Fields:**
- `description` (string) - Project description
- `color` (string) - Hex color code
- `status` (string) - Project status (ACTIVE, ON_HOLD, COMPLETED, CANCELLED)
- `startDate` (string) - Start date
- `endDate` (string) - End date
- `budget` (number) - Project budget
- `customFields` (object) - Custom field values

#### List Projects

Get all projects with optional filtering.

```http
GET /projects
```

**Query Parameters:**

- `workspaceId` (string) - Filter by workspace
- `status` (string) - Filter by status
- `cursor` (string) - Pagination cursor
- `limit` (integer) - Number of results (1-100, default: 20)

#### Get Project

Get a specific project by ID.

```http
GET /projects/{projectId}
```

### Comments

#### Create Comment

Add a comment to a task.

```http
POST /comments
```

**Request Body:**

```json
{
  "taskId": "task_123",
  "content": "This looks great! Just need to update the budget section.",
  "mentions": ["user_456", "user_789"]
}
```

**Required Fields:**
- `taskId` (string) - Task ID
- `content` (string) - Comment text

**Optional Fields:**
- `mentions` (array) - Array of user IDs to mention

#### List Comments

Get comments for a task.

```http
GET /comments
```

**Query Parameters:**

- `taskId` (string) - Required - Task ID
- `cursor` (string) - Pagination cursor
- `limit` (integer) - Number of results (1-100, default: 20)

### Recurring Tasks

#### Create Recurring Task

Create a task that repeats on a schedule.

```http
POST /recurring-tasks
```

**Request Body:**

```json
{
  "name": "Weekly Team Meeting",
  "description": "Review progress and plan for next week",
  "workspaceId": "workspace_123",
  "assigneeId": "user_456",
  "duration": 60,
  "priority": "MEDIUM",
  "recurrence": {
    "frequency": "WEEKLY",
    "interval": 1,
    "daysOfWeek": ["MONDAY"],
    "startDate": "2025-07-15",
    "endDate": "2025-12-31",
    "time": "10:00"
  }
}
```

**Recurrence Options:**

- `frequency` (string) - DAILY, WEEKLY, MONTHLY, YEARLY
- `interval` (integer) - Repeat every N periods
- `daysOfWeek` (array) - For WEEKLY: ["MONDAY", "TUESDAY", etc.]
- `dayOfMonth` (integer) - For MONTHLY: 1-31
- `monthOfYear` (string) - For YEARLY: "JANUARY", "FEBRUARY", etc.
- `startDate` (string) - When to start recurring
- `endDate` (string) - When to stop recurring (optional)
- `time` (string) - Time of day (HH:MM format)

#### List Recurring Tasks

```http
GET /recurring-tasks
```

#### Delete Recurring Task

```http
DELETE /recurring-tasks/{recurringTaskId}
```

**Query Parameters:**

- `deleteInstances` (boolean) - Delete all created instances (default: false)

### Custom Fields

#### Create Custom Field

Define a custom field for tasks or projects.

```http
POST /custom-fields
```

**Request Body:**

```json
{
  "name": "Department",
  "type": "SELECT",
  "entityType": "TASK",
  "workspaceId": "workspace_123",
  "required": false,
  "options": [
    {"label": "Engineering", "value": "eng"},
    {"label": "Marketing", "value": "mkt"},
    {"label": "Sales", "value": "sales"}
  ]
}
```

**Field Types:**

- `TEXT` - Single line text
- `TEXTAREA` - Multi-line text
- `NUMBER` - Numeric value
- `SELECT` - Dropdown selection
- `MULTISELECT` - Multiple selection
- `DATE` - Date picker
- `CHECKBOX` - Boolean
- `URL` - URL field
- `EMAIL` - Email field

#### List Custom Fields

```http
GET /custom-fields
```

**Query Parameters:**

- `workspaceId` (string) - Filter by workspace
- `entityType` (string) - Filter by entity type (TASK, PROJECT)

#### Delete Custom Field

```http
DELETE /custom-fields/{customFieldId}
```

### Schedules

#### List Schedules

Get scheduling information for users.

```http
GET /schedules
```

**Query Parameters:**

- `userId` (string) - User ID (defaults to current user)
- `startDate` (string) - Start of date range
- `endDate` (string) - End of date range
- `includeBlocked` (boolean) - Include blocked time (default: true)

**Response:**

```json
{
  "data": {
    "userId": "user_123",
    "schedule": [
      {
        "date": "2025-07-15",
        "blocks": [
          {
            "startTime": "09:00",
            "endTime": "10:00",
            "type": "TASK",
            "taskId": "task_456",
            "taskName": "Project Review"
          },
          {
            "startTime": "14:00",
            "endTime": "15:00",
            "type": "MEETING",
            "title": "Team Standup"
          }
        ]
      }
    ]
  }
}
```

### Statuses

#### Get Statuses

Get available statuses for a workspace.

```http
GET /statuses
```

**Query Parameters:**

- `workspaceId` (string) - Workspace ID

**Response:**

```json
{
  "data": [
    {
      "id": "status_1",
      "name": "To Do",
      "type": "TODO",
      "color": "#808080",
      "order": 1
    },
    {
      "id": "status_2",
      "name": "In Progress",
      "type": "IN_PROGRESS",
      "color": "#3B82F6",
      "order": 2
    },
    {
      "id": "status_3",
      "name": "Done",
      "type": "DONE",
      "color": "#10B981",
      "order": 3
    }
  ]
}
```

## Data Types

### Task Object

```typescript
interface Task {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  projectId?: string;
  assignee?: User;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  duration?: number;
  labels: string[];
  customFields: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}
```

### Project Object

```typescript
interface Project {
  id: string;
  name: string;
  description?: string;
  workspaceId: string;
  color?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
  customFields: Record<string, any>;
  taskCount: number;
  completedTaskCount: number;
  createdAt: string;
  updatedAt: string;
}
```

### User Object

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  timezone?: string;
  createdAt: string;
}
```

### Enums

```typescript
enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
  BLOCKED = "BLOCKED"
}

enum Priority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}

enum ProjectStatus {
  ACTIVE = "ACTIVE",
  ON_HOLD = "ON_HOLD",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED"
}

enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER"
}
```

## Pagination

Motion uses cursor-based pagination for all list endpoints.

### Request

```http
GET /tasks?limit=50&cursor=eyJpZCI6MTIzfQ==
```

### Response

```json
{
  "data": [...],
  "meta": {
    "hasMore": true,
    "cursor": "eyJpZCI6MTczfQ=="
  }
}
```

### Implementation Example

```javascript
async function getAllTasks() {
  const tasks = [];
  let cursor = null;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(
      `https://api.usemotion.com/v1/tasks?limit=100${cursor ? `&cursor=${cursor}` : ''}`,
      {
        headers: {
          'X-API-Key': process.env.MOTION_API_KEY
        }
      }
    );

    const data = await response.json();
    tasks.push(...data.data);
    
    hasMore = data.meta.hasMore;
    cursor = data.meta.cursor;
  }

  return tasks;
}
```

## Webhooks

Motion supports webhooks for real-time event notifications.

### Webhook Events

- `task.created` - Task created
- `task.updated` - Task updated
- `task.deleted` - Task deleted
- `task.completed` - Task marked as done
- `project.created` - Project created
- `project.updated` - Project updated
- `project.deleted` - Project deleted
- `comment.created` - Comment added

### Webhook Payload

```json
{
  "id": "webhook_event_123",
  "type": "task.updated",
  "timestamp": "2025-07-14T10:00:00Z",
  "data": {
    "task": {
      "id": "task_456",
      "name": "Updated task",
      // ... full task object
    },
    "changes": {
      "status": {
        "from": "TODO",
        "to": "IN_PROGRESS"
      }
    }
  }
}
```

### Webhook Security

Webhooks include a signature header for verification:

```http
X-Motion-Signature: sha256=a1b2c3d4e5f6...
```

Verify the signature using your webhook secret:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = 'sha256=' + 
    crypto.createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Code Examples

### JavaScript/Node.js

#### Basic Setup

```javascript
const axios = require('axios');

const motionApi = axios.create({
  baseURL: 'https://api.usemotion.com/v1',
  headers: {
    'X-API-Key': process.env.MOTION_API_KEY,
    'Content-Type': 'application/json'
  }
});

// Handle rate limiting with exponential backoff
motionApi.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 30;
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return motionApi.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

#### Create Task with Error Handling

```javascript
async function createTask(taskData) {
  try {
    const response = await motionApi.post('/tasks', {
      name: taskData.name,
      description: taskData.description,
      workspaceId: taskData.workspaceId,
      dueDate: new Date(taskData.dueDate).toISOString(),
      priority: taskData.priority || 'MEDIUM',
      assigneeId: taskData.assigneeId
    });

    console.log('Task created:', response.data.data);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      console.error('API Error:', error.response.data.error);
      
      // Handle validation errors
      if (error.response.status === 422) {
        console.error('Validation errors:', error.response.data.error.details);
      }
    } else {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}
```

#### Batch Operations

```javascript
async function batchCreateTasks(tasks) {
  const results = {
    successful: [],
    failed: []
  };

  // Use Promise.allSettled to handle partial failures
  const promises = tasks.map(task => 
    createTask(task)
      .then(result => ({ status: 'fulfilled', value: result }))
      .catch(error => ({ status: 'rejected', reason: error }))
  );

  const outcomes = await Promise.allSettled(promises);

  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'fulfilled') {
      results.successful.push(outcome.value);
    } else {
      results.failed.push({
        task: tasks[index],
        error: outcome.reason
      });
    }
  });

  return results;
}
```

### Python

```python
import os
import time
import requests
from typing import Dict, List, Optional
from datetime import datetime

class MotionAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.usemotion.com/v1"
        self.session = requests.Session()
        self.session.headers.update({
            "X-API-Key": api_key,
            "Content-Type": "application/json"
        })
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make API request with automatic retry on rate limit."""
        url = f"{self.base_url}{endpoint}"
        
        for attempt in range(3):
            response = self.session.request(method, url, **kwargs)
            
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 30))
                time.sleep(retry_after)
                continue
            
            response.raise_for_status()
            return response.json()
        
        raise Exception("Max retries exceeded")
    
    def create_task(self, 
                    name: str,
                    workspace_id: str,
                    description: Optional[str] = None,
                    due_date: Optional[datetime] = None,
                    priority: str = "MEDIUM",
                    assignee_id: Optional[str] = None) -> Dict:
        """Create a new task."""
        data = {
            "name": name,
            "workspaceId": workspace_id,
            "priority": priority
        }
        
        if description:
            data["description"] = description
        if due_date:
            data["dueDate"] = due_date.isoformat()
        if assignee_id:
            data["assigneeId"] = assignee_id
        
        return self._make_request("POST", "/tasks", json=data)
    
    def list_tasks(self, 
                   workspace_id: Optional[str] = None,
                   status: Optional[str] = None,
                   limit: int = 20) -> List[Dict]:
        """List tasks with optional filters."""
        params = {"limit": limit}
        
        if workspace_id:
            params["workspaceId"] = workspace_id
        if status:
            params["status"] = status
        
        tasks = []
        cursor = None
        
        while True:
            if cursor:
                params["cursor"] = cursor
            
            response = self._make_request("GET", "/tasks", params=params)
            tasks.extend(response["data"])
            
            if not response["meta"]["hasMore"]:
                break
            
            cursor = response["meta"]["cursor"]
        
        return tasks

# Usage example
if __name__ == "__main__":
    api = MotionAPI(os.environ["MOTION_API_KEY"])
    
    # Create a task
    task = api.create_task(
        name="Review Q3 Report",
        workspace_id="workspace_123",
        description="Review and provide feedback on Q3 financial report",
        due_date=datetime(2025, 7, 30, 17, 0),
        priority="HIGH"
    )
    
    print(f"Created task: {task['data']['id']}")
```

### cURL Examples

#### Create Task

```bash
curl -X POST https://api.usemotion.com/v1/tasks \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Complete project documentation",
    "workspaceId": "workspace_123",
    "priority": "HIGH",
    "dueDate": "2025-07-20T17:00:00Z"
  }'
```

#### List Tasks with Filters

```bash
curl -X GET "https://api.usemotion.com/v1/tasks?workspaceId=workspace_123&status=IN_PROGRESS&limit=50" \
  -H "X-API-Key: your-api-key-here"
```

#### Update Task Status

```bash
curl -X PUT https://api.usemotion.com/v1/tasks/task_456 \
  -H "X-API-Key: your-api-key-here" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DONE"
  }'
```

## SDKs and Libraries

### Official SDKs

Motion does not currently provide official SDKs. The REST API can be used directly with any HTTP client.

### Community Libraries

Several community-maintained libraries are available:

- **Node.js/TypeScript**: Various npm packages available
- **Python**: Community packages on PyPI
- **Go**: Community implementations on GitHub

### Integration Platforms

Motion is integrated with several platforms:

- **Zapier**: 5000+ app integrations
- **Make (Integromat)**: Visual automation workflows
- **Pipedream**: Code-based integrations
- **n8n**: Open-source automation

## Best Practices

### 1. Error Handling

Always implement comprehensive error handling:

```javascript
try {
  const result = await apiCall();
} catch (error) {
  if (error.response) {
    // API error
    switch (error.response.status) {
      case 400:
        console.error('Bad request:', error.response.data);
        break;
      case 401:
        console.error('Authentication failed');
        break;
      case 429:
        console.error('Rate limited');
        break;
      default:
        console.error('API error:', error.response.status);
    }
  } else if (error.request) {
    // Network error
    console.error('Network error:', error.message);
  } else {
    // Other error
    console.error('Error:', error.message);
  }
}
```

### 2. Rate Limit Management

Implement a queue system for API requests:

```javascript
const PQueue = require('p-queue');

// Create queue with concurrency based on your plan
const queue = new PQueue({
  concurrency: 1,
  interval: 60000, // 1 minute
  intervalCap: 120 // Requests per interval
});

// Add requests to queue
const task = await queue.add(() => createTask(taskData));
```

### 3. Caching

Cache frequently accessed data:

```javascript
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getCachedProject(projectId) {
  const cached = cache.get(projectId);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const project = await api.get(`/projects/${projectId}`);
  cache.set(projectId, {
    data: project,
    timestamp: Date.now()
  });
  
  return project;
}
```

### 4. Bulk Operations

Batch operations when possible:

```javascript
// Instead of creating tasks one by one
for (const task of tasks) {
  await createTask(task); // Slow, hits rate limits
}

// Use concurrent requests with rate limiting
const results = await Promise.all(
  tasks.map(task => 
    queue.add(() => createTask(task))
  )
);
```

### 5. Webhook Processing

Process webhooks asynchronously:

```javascript
app.post('/webhooks/motion', (req, res) => {
  // Verify signature
  if (!verifySignature(req.body, req.headers['x-motion-signature'])) {
    return res.status(401).send('Invalid signature');
  }
  
  // Acknowledge receipt immediately
  res.status(200).send('OK');
  
  // Process webhook asynchronously
  processWebhookAsync(req.body);
});
```

### 6. Data Validation

Always validate data before sending to API:

```javascript
const Joi = require('joi');

const taskSchema = Joi.object({
  name: Joi.string().required().max(255),
  workspaceId: Joi.string().required(),
  description: Joi.string().max(5000),
  dueDate: Joi.date().iso().min('now'),
  priority: Joi.string().valid('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
  assigneeId: Joi.string()
});

function validateTask(taskData) {
  const { error, value } = taskSchema.validate(taskData);
  if (error) {
    throw new Error(`Validation error: ${error.details[0].message}`);
  }
  return value;
}
```

### 7. Monitoring and Logging

Implement comprehensive logging:

```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'motion-api.log' })
  ]
});

// Log all API requests
motionApi.interceptors.request.use(request => {
  logger.info('API Request', {
    method: request.method,
    url: request.url,
    timestamp: new Date().toISOString()
  });
  return request;
});

// Log responses
motionApi.interceptors.response.use(
  response => {
    logger.info('API Response', {
      status: response.status,
      url: response.config.url,
      duration: response.duration
    });
    return response;
  },
  error => {
    logger.error('API Error', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url
    });
    return Promise.reject(error);
  }
);
```

### 8. Security Best Practices

1. **Environment Variables**: Never hardcode API keys
   ```bash
   MOTION_API_KEY=your-key-here
   ```

2. **Secure Storage**: Use secrets management services in production
   
3. **Minimal Permissions**: Request only necessary scopes
   
4. **HTTPS Only**: Always use HTTPS for API communication
   
5. **Input Sanitization**: Sanitize all user input before API calls

6. **Audit Logging**: Log all API operations for security audits

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Verify API key is correct
   - Check key hasn't expired
   - Ensure key has required permissions

2. **429 Rate Limited**
   - Implement exponential backoff
   - Check your plan's rate limits
   - Use request queuing

3. **422 Validation Error**
   - Check required fields
   - Verify date formats (ISO 8601)
   - Validate enum values

4. **404 Not Found**
   - Verify resource IDs
   - Check workspace access
   - Ensure resource hasn't been deleted

5. **500 Server Error**
   - Retry with exponential backoff
   - Check Motion status page
   - Contact support if persistent

### Debug Mode

Enable detailed logging for debugging:

```javascript
if (process.env.DEBUG) {
  motionApi.interceptors.request.use(request => {
    console.log('Request:', JSON.stringify(request, null, 2));
    return request;
  });
  
  motionApi.interceptors.response.use(
    response => {
      console.log('Response:', JSON.stringify(response.data, null, 2));
      return response;
    },
    error => {
      console.error('Error Details:', error.response?.data);
      return Promise.reject(error);
    }
  );
}
```

## Resources

### Official Resources

- **API Documentation**: [https://docs.usemotion.com/](https://docs.usemotion.com/)
- **Getting Started Guide**: [https://docs.usemotion.com/cookbooks/getting-started/](https://docs.usemotion.com/cookbooks/getting-started/)
- **Help Center**: [https://help.usemotion.com/](https://help.usemotion.com/)
- **Status Page**: [https://status.usemotion.com/](https://status.usemotion.com/)

### Community Resources

- **GitHub Topics**: Search for "motion-api" on GitHub
- **Stack Overflow**: Tag questions with "motion-api"
- **Discord/Slack Communities**: Join Motion user communities

### Support

- **Email**: support@usemotion.com
- **In-app Support**: Available in Motion app
- **Enterprise Support**: Contact sales for dedicated support

---

*This reference is based on publicly available information and may not reflect the most recent API changes. Always refer to the official Motion API documentation for the most up-to-date information.*