# Motion API Project Limitations

Based on testing with the Motion API (as of January 2025), projects have significant limitations compared to tasks:

## Key Findings

1. **Projects are Read-Only After Creation**
   - The Motion API does not support updating project properties
   - PATCH, PUT, and POST methods to `/projects/{id}` all return 404
   - This includes updating name, description, status, or priority

2. **Projects Cannot Be Deleted**
   - DELETE requests to `/projects/{id}` return 404
   - Once created, projects remain in the workspace permanently

3. **Projects Have a `priorityLevel` Field**
   - Projects include a `priorityLevel` field (e.g., "MEDIUM", "HIGH")
   - However, this field cannot be modified via the API
   - The priority is likely set through the Motion UI only

## Test Results

All attempted update methods failed:
```
PATCH /projects/{id} -> 404 Not Found
PUT /projects/{id} -> 404 Not Found
POST /projects/{id} -> 404 Not Found
DELETE /projects/{id} -> 404 Not Found
```

## Implications

- Projects should be carefully planned before creation
- Any changes to projects must be done through the Motion UI
- The MCP server has been updated to remove non-functional update/delete tools
- Only list, get, and create operations are supported for projects

## Comparison with Tasks

Unlike projects, tasks support full CRUD operations:
- Tasks can be updated (name, description, priority, status, etc.)
- Tasks can be deleted
- Tasks can be moved between projects
- Tasks have much more flexibility via the API