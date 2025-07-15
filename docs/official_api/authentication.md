# Authentication

Motion API uses API key authentication for all requests.

## Obtaining an API Key

1. Log in to your Motion account
2. Navigate to Account Settings
3. Find the API section
4. Generate or copy your API key

## Using the API Key

Include your API key in the request header:

```http
X-API-Key: YOUR_API_KEY_HERE
```

## Example Request

```bash
curl -X GET https://api.usemotion.com/v1/users/me \
  -H "X-API-Key: YOUR_API_KEY_HERE"
```

## Security Best Practices

- **Never expose your API key** in client-side code or public repositories
- **Rotate your API key** regularly
- **Use environment variables** to store your API key
- **Restrict API key access** to only necessary team members

## Rate Limits

Your API key is subject to rate limits based on your account type:

- **Individual accounts**: 12 requests per minute
- **Team accounts**: 120 requests per minute

Exceeding rate limits will result in `429 Too Many Requests` responses.