# Get Current User

Retrieve information about the currently authenticated user (the owner of the API key).

## Endpoint

```
GET /v1/users/me
```

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET https://api.usemotion.com/v1/users/me \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

Returns the current user object:

```json
{
  "id": "user_123",
  "name": "John Doe",
  "email": "john.doe@example.com"
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
async function getCurrentUser() {
  const response = await fetch(
    'https://api.usemotion.com/v1/users/me',
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get current user: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const currentUser = await getCurrentUser();
  console.log(`Authenticated as: ${currentUser.name} (${currentUser.email})`);
  console.log(`User ID: ${currentUser.id}`);
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os

def get_current_user():
    url = "https://api.usemotion.com/v1/users/me"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    response = requests.get(url, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    current_user = get_current_user()
    print(f"Authenticated as: {current_user['name']} ({current_user['email']})")
    print(f"User ID: {current_user['id']}")
    
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Authentication Check

```javascript
async function verifyAuthentication() {
  try {
    const user = await getCurrentUser();
    return {
      authenticated: true,
      user: user
    };
  } catch (error) {
    return {
      authenticated: false,
      error: error.message
    };
  }
}

// Verify API key is valid
const auth = await verifyAuthentication();
if (auth.authenticated) {
  console.log(`✓ Authenticated as ${auth.user.name}`);
} else {
  console.log(`✗ Authentication failed: ${auth.error}`);
}
```

### Initialize Application Context

```javascript
async function initializeApp() {
  try {
    // Get current user for context
    const currentUser = await getCurrentUser();
    
    // Store in application context
    const appContext = {
      currentUserId: currentUser.id,
      currentUserName: currentUser.name,
      currentUserEmail: currentUser.email
    };
    
    console.log('App initialized with user context');
    return appContext;
    
  } catch (error) {
    throw new Error(`Failed to initialize app: ${error.message}`);
  }
}

// Initialize app with user context
const context = await initializeApp();
```

### Create Self-Assigned Task

```javascript
async function createSelfAssignedTask(taskData) {
  // Get current user ID
  const currentUser = await getCurrentUser();
  
  // Create task assigned to self
  const task = await createTask({
    ...taskData,
    assigneeId: currentUser.id
  });
  
  return task;
}

// Create a task for yourself
const myTask = await createSelfAssignedTask({
  name: 'Review API documentation',
  workspaceId: 'workspace_123',
  dueDate: '2024-12-31T17:00:00Z',
  duration: 60
});

console.log(`Created self-assigned task: ${myTask.name}`);
```

## Use Cases

### 1. API Key Validation

Use this endpoint to verify an API key is valid:

```javascript
async function isApiKeyValid(apiKey) {
  try {
    const response = await fetch('https://api.usemotion.com/v1/users/me', {
      headers: { 'X-API-Key': apiKey }
    });
    return response.ok;
  } catch {
    return false;
  }
}
```

### 2. User Context Display

Show the authenticated user in your application:

```javascript
const user = await getCurrentUser();
document.getElementById('user-info').textContent = 
  `Logged in as: ${user.name}`;
```

### 3. Audit Logging

Track API usage by user:

```javascript
async function logApiAction(action, details) {
  const user = await getCurrentUser();
  console.log(`[${new Date().toISOString()}] ${user.email}: ${action}`, details);
}

await logApiAction('Created task', { taskId: 'task_123' });
```

### 4. Permission Checking

Verify user identity before sensitive operations:

```javascript
async function canPerformAdminAction() {
  const user = await getCurrentUser();
  const adminEmails = ['admin@example.com', 'superuser@example.com'];
  return adminEmails.includes(user.email);
}
```

## Response Fields

- **id**: Unique identifier for the user
- **name**: User's display name
- **email**: User's email address

## Notes

- This endpoint always returns the user who owns the API key
- No parameters are needed - authentication is via API key
- Useful for determining context in multi-user applications
- The user ID can be used for task assignments
- Email is unique within an organization