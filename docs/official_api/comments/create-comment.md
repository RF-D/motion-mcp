# Create Comment

Add a new comment to a task.

## Endpoint

```
POST /v1/comments
```

## Request

### Headers

```http
X-API-Key: YOUR_API_KEY
Content-Type: application/json
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| taskId | string | Yes | The task on which to place a comment |
| content | string | Yes | GitHub Flavored Markdown representing the comment |

### Example Request

```bash
curl -X POST https://api.usemotion.com/v1/comments \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task_123",
    "content": "**Status Update**: Completed the initial design phase.\n\nNext steps:\n- Review with stakeholders\n- Implement feedback\n- Finalize designs"
  }'
```

## Response

### Success Response (200 OK)

Returns the created comment with HTML-formatted content:

```json
{
  "id": "comment_new_001",
  "taskId": "task_123",
  "content": "<p><strong>Status Update</strong>: Completed the initial design phase.</p>\n<p>Next steps:</p>\n<ul>\n<li>Review with stakeholders</li>\n<li>Implement feedback</li>\n<li>Finalize designs</li>\n</ul>",
  "createdAt": "2024-12-15T16:30:00Z",
  "creator": {
    "id": "user_456",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Error Responses

#### 400 Bad Request

Missing required fields:

```json
{
  "error": {
    "message": "Missing required field: content",
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

## Markdown Examples

### 1. Simple Text Comment

```json
{
  "taskId": "task_123",
  "content": "This looks good to me. Approved!"
}
```

### 2. Formatted Status Update

```json
{
  "taskId": "task_123",
  "content": "## Progress Update\n\n**Completed:**\n- ✅ Database schema design\n- ✅ API endpoints implementation\n\n**In Progress:**\n- 🔄 Frontend integration\n\n**Blocked:**\n- ❌ Waiting for design assets"
}
```

### 3. Code Review Comment

```json
{
  "taskId": "task_123",
  "content": "Found an issue in the implementation:\n\n```javascript\n// Current implementation\nconst result = data.filter(item => item.status = 'active');\n\n// Should be (note the comparison operator)\nconst result = data.filter(item => item.status === 'active');\n```\n\nThis bug causes all items to be marked as active."
}
```

### 4. Mention Team Members

```json
{
  "taskId": "task_123",
  "content": "@jane @bob Please review the updated requirements in the attached document.\n\n**Key changes:**\n1. Extended deadline to end of month\n2. Added mobile support requirement\n3. Simplified authentication flow"
}
```

### 5. Links and References

```json
{
  "taskId": "task_123",
  "content": "Related resources:\n- [Design mockups](https://figma.com/file/abc123)\n- [API documentation](https://docs.example.com/api)\n- [Previous discussion](#comment_789)\n\nPlease review before our meeting tomorrow."
}
```

## Code Examples

### JavaScript

```javascript
async function createComment(taskId, content) {
  const response = await fetch(
    'https://api.usemotion.com/v1/comments',
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.MOTION_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        taskId,
        content
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to create comment: ${error.error.message}`);
  }

  return await response.json();
}

// Usage examples
// Simple comment
const comment1 = await createComment(
  'task_123',
  'Task completed successfully!'
);

// Formatted comment
const comment2 = await createComment(
  'task_456',
  `## Review Complete

**Findings:**
- Code quality: ✅ Excellent
- Test coverage: ⚠️ Needs improvement (currently 75%)
- Documentation: ✅ Complete

**Recommendation:** Approve with minor changes.`
);
```

### Python

```python
import requests
import json
import os

def create_comment(task_id, content):
    url = "https://api.usemotion.com/v1/comments"
    headers = {
        "X-API-Key": os.environ.get("MOTION_API_KEY"),
        "Content-Type": "application/json"
    }
    
    data = {
        "taskId": task_id,
        "content": content
    }
    
    response = requests.post(url, headers=headers, json=data)
    response.raise_for_status()
    
    return response.json()

# Usage
# Simple comment
comment1 = create_comment(
    "task_123",
    "Task completed successfully!"
)

# Formatted comment with markdown
comment2 = create_comment(
    "task_456",
    """## Review Complete

**Findings:**
- Code quality: ✅ Excellent
- Test coverage: ⚠️ Needs improvement (currently 75%)
- Documentation: ✅ Complete

**Recommendation:** Approve with minor changes."""
)

print(f"Created comment: {comment2['id']}")
```

### Comment Templates

```javascript
// Create reusable comment templates
const commentTemplates = {
  statusUpdate: (status, details) => `
## Status Update

**Current Status:** ${status}

${details}

_Updated at ${new Date().toLocaleString()}_
  `,
  
  codeReview: (findings, recommendation) => `
## Code Review

**Findings:**
${findings.map(f => `- ${f}`).join('\n')}

**Recommendation:** ${recommendation}
  `,
  
  blocked: (reason, needsFrom) => `
⚠️ **BLOCKED**

**Reason:** ${reason}

**Needs from:** ${needsFrom}

Please unblock ASAP to maintain timeline.
  `
};

// Use templates
await createComment(
  'task_123',
  commentTemplates.statusUpdate(
    'In Progress',
    'Completed backend implementation. Starting frontend work.'
  )
);

await createComment(
  'task_456',
  commentTemplates.blocked(
    'Waiting for API credentials',
    '@jane from DevOps team'
  )
);
```

## Markdown Support

### Supported Elements

- **Headers**: `# H1`, `## H2`, `### H3`, etc.
- **Bold**: `**bold**` or `__bold__`
- **Italic**: `*italic*` or `_italic_`
- **Links**: `[text](url)`
- **Images**: `![alt text](url)`
- **Lists**: `- item` or `1. item`
- **Code**: `` `inline` `` or ` ```block``` `
- **Quotes**: `> quoted text`
- **Tables**: Using pipe syntax
- **Task Lists**: `- [ ] unchecked` or `- [x] checked`
- **Line Breaks**: Two spaces at end of line or `\n\n`

### Unsupported Elements

- HTML tags (will be escaped)
- JavaScript or other scripts
- Embedded media (except images)

## Best Practices

1. **Use Markdown**: Format comments for better readability
2. **Be Concise**: Keep comments focused and relevant
3. **Add Context**: Include why, not just what
4. **Use Templates**: Create consistent comment formats
5. **Tag People**: Use @mentions for visibility
6. **Include Links**: Reference related resources
7. **Update Status**: Keep task status current through comments

## Notes

- Comments cannot be edited after creation
- Comments cannot be deleted via API
- The creator is automatically set to the API key owner
- Content is converted from Markdown to HTML
- Maximum content length depends on your plan