# Comments API

The Comments API allows you to add and retrieve comments on tasks, enabling collaboration and communication within Motion.

## Overview

Comments provide a way to:
- Add context and updates to tasks
- Collaborate with team members
- Track task progress and decisions
- Create an audit trail of task-related discussions

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/comments` | [Get all comments for a task](./get-comments.md) |
| POST | `/v1/comments` | [Create a new comment on a task](./create-comment.md) |

## Comment Object

```javascript
{
  id: string,           // Unique comment identifier
  taskId: string,       // Associated task ID
  content: string,      // HTML content (converted from Markdown)
  createdAt: datetime,  // ISO 8601 creation timestamp
  creator: {
    id: string,         // User ID
    name: string,       // User name
    email: string       // User email
  }
}
```

## Content Format

- **Input**: Comments are created using GitHub Flavored Markdown
- **Output**: Comments are returned as HTML

### Supported Markdown Features

- **Bold**: `**text**` or `__text__`
- **Italic**: `*text*` or `_text_`
- **Links**: `[text](url)`
- **Code**: `` `inline code` `` or code blocks
- **Lists**: Ordered and unordered
- **Headers**: `# H1`, `## H2`, etc.
- **Quotes**: `> quoted text`

## Common Use Cases

### 1. Task Updates

```javascript
POST /v1/comments
{
  "taskId": "task_123",
  "content": "**Update**: Completed the initial research phase. Moving to implementation."
}
```

### 2. Questions and Clarifications

```javascript
POST /v1/comments
{
  "taskId": "task_456",
  "content": "@jane Could you clarify the requirements for the third deliverable?"
}
```

### 3. Progress Tracking

```javascript
POST /v1/comments
{
  "taskId": "task_789",
  "content": "## Progress Update\n- [x] Design mockups\n- [x] API implementation\n- [ ] Frontend integration\n- [ ] Testing"
}
```

## Best Practices

1. **Use Markdown**: Take advantage of formatting to make comments more readable
2. **Be Concise**: Keep comments focused and relevant to the task
3. **Regular Updates**: Add comments for significant progress or changes
4. **Tag Team Members**: Use @mentions to notify specific users
5. **Include Context**: Reference relevant information or decisions

## Rate Limits

Comments API follows the same rate limits as other Motion APIs:
- Individual accounts: 12 requests per minute
- Team accounts: 120 requests per minute

## Related Resources

- [Tasks API](../tasks/) - Manage tasks that comments are attached to
- [Users API](../users/) - Get information about comment creators