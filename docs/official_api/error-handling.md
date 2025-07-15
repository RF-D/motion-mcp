# Error Handling

The Motion API uses standard HTTP status codes to indicate the success or failure of requests.

## HTTP Status Codes

### Success Codes

- **200 OK** - Request succeeded
- **201 Created** - Resource created successfully
- **204 No Content** - Request succeeded with no response body (e.g., DELETE)

### Client Error Codes

- **400 Bad Request** - Invalid request parameters or body
- **401 Unauthorized** - Missing or invalid API key
- **403 Forbidden** - Valid API key but insufficient permissions
- **404 Not Found** - Requested resource doesn't exist
- **422 Unprocessable Entity** - Request validation failed
- **429 Too Many Requests** - Rate limit exceeded

### Server Error Codes

- **500 Internal Server Error** - Server encountered an error
- **503 Service Unavailable** - Service temporarily unavailable

## Error Response Format

Error responses include a JSON body with error details:

```json
{
  "error": {
    "message": "Human-readable error description",
    "code": "ERROR_CODE"
  }
}
```

## Common Error Codes

### Authentication Errors
- `INVALID_API_KEY` - API key is invalid or expired
- `MISSING_API_KEY` - X-API-Key header not provided

### Validation Errors
- `INVALID_PARAMETER` - Request parameter is invalid
- `MISSING_REQUIRED_FIELD` - Required field not provided
- `INVALID_DATE_FORMAT` - Date not in ISO 8601 format

### Resource Errors
- `RESOURCE_NOT_FOUND` - Requested resource doesn't exist
- `RESOURCE_ALREADY_EXISTS` - Attempting to create duplicate resource

### Rate Limiting
- `RATE_LIMIT_EXCEEDED` - Too many requests in time window

## Handling Errors

### Example Error Handling (JavaScript)

```javascript
async function makeAPIRequest(endpoint, options) {
  try {
    const response = await fetch(
      `https://api.usemotion.com/v1${endpoint}`,
      {
        ...options,
        headers: {
          'X-API-Key': process.env.MOTION_API_KEY,
          'Content-Type': 'application/json',
          ...options.headers
        }
      }
    );

    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 401:
          throw new Error('Invalid API key');
        case 429:
          throw new Error('Rate limit exceeded. Please retry later.');
        case 404:
          throw new Error(`Resource not found: ${error.error.message}`);
        default:
          throw new Error(error.error.message || 'API request failed');
      }
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
```

### Rate Limit Handling

When you receive a 429 response, implement exponential backoff:

```javascript
async function withRetry(fn, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('Rate limit') && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

## Best Practices

1. **Always check response status** before processing the response body
2. **Log errors** for debugging but don't expose sensitive information
3. **Implement retry logic** for transient errors (429, 503)
4. **Validate inputs** before making API requests to reduce errors
5. **Handle specific error codes** to provide better user experience