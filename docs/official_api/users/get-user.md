# Get User

Retrieve information about a specific user by their ID.

## Endpoint

```
GET /v1/users/{id}
```

## Parameters

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | The ID of the user to retrieve |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET https://api.usemotion.com/v1/users/user_456 \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns the user object:

```json
{
  "id": "user_456",
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

### Error Responses

#### 404 Not Found

User doesn't exist:

```json
{
  "error": {
    "message": "User not found",
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

#### 403 Forbidden

No access to user information:

```json
{
  "error": {
    "message": "You do not have access to this user",
    "code": "INSUFFICIENT_PERMISSIONS"
  }
}
```

## Code Examples

### JavaScript

```javascript
async function getUser(userId) {
  const response = await fetch(
    `https://api.usemotion.com/v1/users/${userId}`,
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get user: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const user = await getUser('user_456');
  console.log(`User: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`ID: ${user.id}`);
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def get_user(user_id):
    url = f"https://api.usemotion.com/v1/users/{user_id}"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    user = get_user("user_456")
    print(f"User: {user['name']}")
    print(f"Email: {user['email']}")
    print(f"ID: {user['id']}")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Get User with Error Handling

```javascript
async function getUserSafely(userId) {
  try {
    const user = await getUser(userId);
    return { success: true, user };
  } catch (error) {
    if (error.message.includes('not found')) {
      return { success: false, error: 'User does not exist' };
    }
    return { success: false, error: error.message };
  }
}

// Safe user retrieval
const result = await getUserSafely('user_456');
if (result.success) {
  console.log(`Found user: ${result.user.name}`);
} else {
  console.log(`Error: ${result.error}`);
}
```

### Batch Get Users

```javascript
async function getMultipleUsers(userIds) {
  const users = [];
  const errors = [];
  
  for (const userId of userIds) {
    try {
      const user = await getUser(userId);
      users.push(user);
    } catch (error) {
      errors.push({
        userId,
        error: error.message
      });
    }
  }
  
  return { users, errors };
}

// Get multiple users
const userIds = ['user_123', 'user_456', 'user_789'];
const { users, errors } = await getMultipleUsers(userIds);

console.log(`Retrieved ${users.length} users`);
if (errors.length > 0) {
  console.log(`Failed to retrieve ${errors.length} users`);
}
```

### Display Task Assignee

```javascript
async function getTaskWithAssigneeDetails(taskId) {
  // First get the task
  const task = await getTask(taskId);
  
  // Then get assignee details
  const assigneeDetails = [];
  for (const assignee of task.assignees) {
    try {
      const user = await getUser(assignee.id);
      assigneeDetails.push(user);
    } catch (error) {
      // Handle case where user might be deleted
      assigneeDetails.push({
        id: assignee.id,
        name: 'Unknown User',
        email: 'unknown'
      });
    }
  }
  
  return {
    ...task,
    assigneeDetails
  };
}

// Get task with full assignee information
const taskWithDetails = await getTaskWithAssigneeDetails('task_123');
console.log(`Task: ${taskWithDetails.name}`);
taskWithDetails.assigneeDetails.forEach(user => {
  console.log(`  Assigned to: ${user.name} (${user.email})`);
});
```

### Validate User Before Assignment

```javascript
async function validateAndAssignTask(taskId, userId) {
  // Validate user exists
  try {
    const user = await getUser(userId);
    console.log(`Assigning task to ${user.name}`);
    
    // Update task with validated user
    const updatedTask = await updateTask(taskId, {
      assigneeId: userId
    });
    
    return {
      success: true,
      message: `Task assigned to ${user.name}`,
      task: updatedTask
    };
    
  } catch (error) {
    if (error.message.includes('not found')) {
      return {
        success: false,
        message: 'Cannot assign task: User does not exist'
      };
    }
    throw error;
  }
}

// Validate user before assignment
const result = await validateAndAssignTask('task_123', 'user_456');
if (result.success) {
  console.log(result.message);
} else {
  console.error(result.message);
}
```

### Build User Directory

```javascript
async function buildUserDirectory(workspace) {
  const directory = new Map();
  
  // Get all tasks to find unique users
  const tasks = await listTasks({ workspaceId: workspace.id });
  
  // Collect unique user IDs
  const userIds = new Set();
  tasks.tasks.forEach(task => {
    if (task.creator) userIds.add(task.creator.id);
    task.assignees.forEach(a => userIds.add(a.id));
  });
  
  // Get user details
  for (const userId of userIds) {
    try {
      const user = await getUser(userId);
      directory.set(userId, user);
    } catch (error) {
      console.warn(`Could not retrieve user ${userId}`);
    }
  }
  
  return directory;
}

// Build directory of users in workspace
const userDirectory = await buildUserDirectory({ id: 'workspace_123' });
console.log(`Found ${userDirectory.size} users in workspace`);
```

## Use Cases

### 1. Display Assignee Information

Show full user details for task assignees:

```javascript
const user = await getUser(task.assignees[0].id);
console.log(`Assigned to: ${user.name} <${user.email}>`);
```

### 2. User Validation

Verify a user exists before operations:

```javascript
async function isValidUser(userId) {
  try {
    await getUser(userId);
    return true;
  } catch {
    return false;
  }
}
```

### 3. User Lookup

Find user details from ID:

```javascript
const userId = 'user_456';  // From task, comment, etc.
const user = await getUser(userId);
```

## Notes

- User must exist and be accessible to the API key
- Limited to users in shared workspaces
- Returns same fields as /users/me endpoint
- Useful for resolving user IDs to names/emails
- Cannot retrieve users outside your organization