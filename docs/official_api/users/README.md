# Users API

The Users API provides access to user information and team member details in Motion.

## Overview

The Users API allows you to:
- Get information about the current authenticated user
- List team members in workspaces
- Retrieve user details for task assignment
- Access user email and identification information

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/v1/users/me` | [Get current user](./get-current-user.md) |
| GET | `/v1/users/{id}` | [Get user by ID](./get-user.md) |

## User Object

```javascript
{
  id: string,      // Unique user identifier
  name: string,    // User's display name
  email: string    // User's email address
}
```

## Common Use Cases

### 1. Get Current User Context

```javascript
GET /v1/users/me
```

Useful for:
- Determining the authenticated user
- Getting user context for UI display
- Validating API key ownership

### 2. Retrieve User for Assignment

```javascript
GET /v1/users/{userId}
```

Useful for:
- Displaying assignee information
- Validating user exists before assignment
- Building user selection interfaces

## Working with Users

### Task Assignment

Users are referenced when:
- Creating tasks with `assigneeId`
- Updating task assignments
- Creating recurring tasks

### User Identification

Users are identified by:
- Unique ID (UUID format)
- Email address (unique within organization)
- Display name (not unique)

## Best Practices

1. **Cache User Data**: User information changes infrequently
2. **Use IDs for Assignment**: Always use user IDs, not names or emails
3. **Validate Users**: Check user exists before assignment
4. **Handle Missing Users**: Gracefully handle deleted or inactive users

## Important Notes

- User creation/modification is not available via API
- User management must be done through Motion app
- API returns limited user information for privacy
- User IDs are stable and don't change

## Related Resources

- [Tasks API](../tasks/) - Assign tasks to users
- [Recurring Tasks API](../recurring-tasks/) - Set up recurring assignments
- [Comments API](../comments/) - See comment creators
- [Workspaces API](../workspaces/) - Users belong to workspaces