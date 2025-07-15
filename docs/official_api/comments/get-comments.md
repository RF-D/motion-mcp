# Get Comments

Retrieve all comments for a specific task.

## Endpoint

```
GET /v1/comments
```

## Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| taskId | string | Yes | The task for which all comments should be returned |
| cursor | string | No | Pagination cursor from previous response |

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
```

### Example Request

```bash
curl -X GET "https://api.usemotion.com/v1/comments?taskId=task_123" \
  -H "X-API-Key: YOUR_API_KEY"
```

### With Pagination

```bash
curl -X GET "https://api.usemotion.com/v1/comments?taskId=task_123&cursor=eyJza2lwIjoyNX0=" \
  -H "X-API-Key: YOUR_API_KEY"
```

## Response

### Success Response (200 OK)

```json
{
  "meta": {
    "nextCursor": "eyJza2lwIjoyNX0=",
    "pageSize": 25
  },
  "comments": [
    {
      "id": "comment_001",
      "taskId": "task_123",
      "content": "<p><strong>Status Update</strong>: Completed the initial design phase.</p>",
      "createdAt": "2024-12-15T10:30:00Z",
      "creator": {
        "id": "user_456",
        "name": "John Doe",
        "email": "john@example.com"
      }
    },
    {
      "id": "comment_002",
      "taskId": "task_123",
      "content": "<p>Great progress! Let's review in tomorrow's standup.</p>",
      "createdAt": "2024-12-15T11:00:00Z",
      "creator": {
        "id": "user_789",
        "name": "Jane Smith",
        "email": "jane@example.com"
      }
    },
    {
      "id": "comment_003",
      "taskId": "task_123",
      "content": "<p>Adding the following requirements:</p><ul><li>Mobile responsive design</li><li>Dark mode support</li></ul>",
      "createdAt": "2024-12-15T14:00:00Z",
      "creator": {
        "id": "user_456",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ]
}
```

### Empty Result

```json
{
  "meta": {
    "nextCursor": null,
    "pageSize": 0
  },
  "comments": []
}
```

### Error Responses

#### 400 Bad Request

Missing required taskId parameter:

```json
{
  "error": {
    "message": "Missing required parameter: taskId",
    "code": "MISSING_REQUIRED_FIELD"
  }
}
```

#### 404 Not Found

Task doesn't exist:

```json
{
  "error": {
    "message": "Task not found",
    "code": "RESOURCE_NOT_FOUND"
  }
}
```

## Pagination

Comments are returned in chronological order (oldest first) with cursor-based pagination:

```javascript
async function getAllComments(taskId) {
  const allComments = [];
  let cursor = null;

  do {
    const params = new URLSearchParams({ taskId });
    if (cursor) params.append('cursor', cursor);

    const response = await fetch(
      `https://api.usemotion.com/v1/comments?${params}`,
      {
        headers: {
          'X-API-Key': process.env.MOTION_API_KEY
        }
      }
    );

    const data = await response.json();
    allComments.push(...data.comments);
    cursor = data.meta.nextCursor;

  } while (cursor);

  return allComments;
}
```

## Code Examples

### JavaScript

```javascript
async function getTaskComments(taskId, cursor = null) {
  const params = new URLSearchParams({ taskId });
  if (cursor) params.append('cursor', cursor);

  const response = await fetch(
    `https://api.usemotion.com/v1/comments?${params}`,
    {
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY
      }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to get comments: ${error.error.message}`);
  }

  return await response.json();
}

// Usage
try {
  const result = await getTaskComments('task_123');
  console.log(`Found ${result.comments.length} comments`);
  
  result.comments.forEach(comment => {
    console.log(`${comment.creator.name}: ${comment.content}`);
  });
} catch (error) {
  console.error('Error:', error);
}
```

### Python

```python
import requests
import os
from urllib.parse import urlencode

def get_task_comments(task_id, cursor=None):
    url = "https://api.usemotion.com/v1/comments"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY")
    }
    
    params = {"taskId": task_id}
    if cursor:
        params["cursor"] = cursor
    
    response = requests.get(url, headers=headers, params=params)
    response.raise_for_status()
    
    return response.json()

# Usage
try:
    result = get_task_comments("task_123")
    print(f"Found {len(result['comments'])} comments")
    
    for comment in result['comments']:
        print(f"{comment['creator']['name']}: {comment['content']}")
        
except requests.exceptions.RequestException as e:
    print(f"Error: {e}")
```

### Display Comments with Formatting

```javascript
function displayComments(comments) {
  comments.forEach(comment => {
    const date = new Date(comment.createdAt);
    const formattedDate = date.toLocaleString();
    
    console.log(`
===================================
${comment.creator.name} - ${formattedDate}
-----------------------------------
${stripHtml(comment.content)}
===================================
    `);
  });
}

function stripHtml(html) {
  // Simple HTML stripping for console display
  return html.replace(/<[^>]*>/g, '');
}

// Usage
const result = await getTaskComments('task_123');
displayComments(result.comments);
```

### Get Recent Comments

```javascript
async function getRecentComments(taskId, hoursAgo = 24) {
  const allComments = await getAllComments(taskId);
  const cutoffTime = new Date();
  cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);
  
  return allComments.filter(comment => 
    new Date(comment.createdAt) > cutoffTime
  );
}

// Get comments from last 24 hours
const recentComments = await getRecentComments('task_123', 24);
console.log(`${recentComments.length} comments in the last 24 hours`);
```

## Response Notes

1. **Content Format**: Comments are returned as HTML, not Markdown
2. **Order**: Comments are returned in chronological order (oldest first)
3. **Creator Info**: Each comment includes full creator information
4. **Task Association**: All comments are associated with a single task
5. **No Editing**: Comments cannot be edited after creation
6. **No Deletion**: The API doesn't support comment deletion

## Best Practices

1. **Cache Results**: Comments don't change, so consider caching
2. **Paginate Large Sets**: Use pagination for tasks with many comments
3. **Parse HTML**: Use an HTML parser if you need plain text
4. **Time Filtering**: Filter comments client-side by creation time
5. **Display Formatting**: Preserve HTML formatting when displaying to users