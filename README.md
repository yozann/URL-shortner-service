# URL Shortner Service

A minimal URL shortener service built with Node.js, TypeScript, Express, and Redis.

## Features

- Create short URLs backed by Redis
- Optional custom short codes
- Optional expiration via TTL
- Redirect short codes to their original URLs
- Health check endpoint

## Requirements

- Node.js 18+
- Redis 7+

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example environment file and adjust values if needed:

   ```bash
   cp .env.example .env
   ```

3. Start Redis locally, then run the service:

   ```bash
   npm run dev
   ```

## Docker Setup

If Node.js is not installed locally, you can run the full stack with Docker:

```bash
docker compose up --build
```

This starts:

- The API on `http://localhost:3000`
- Redis on `localhost:6379`

## Environment Variables

- `PORT`: HTTP port for the API
- `BASE_URL`: Public base URL used to build returned short URLs
- `REDIS_URL`: Redis connection string
- `SHORT_CODE_LENGTH`: Length of generated short codes
- `DEFAULT_TTL_SECONDS`: Default expiration for generated links. Use `0` to disable expiration.

## API

### `GET /health`

Returns service health.

### `POST /api/urls`

Create a short URL.

Request body:

```json
{
  "url": "https://example.com/some/long/path",
  "customCode": "docs123",
  "ttlSeconds": 3600
}
```

Notes:

- `url` is required
- `customCode` is optional and must be unique
- `ttlSeconds` is optional and can be used to expire a link

Example response:

```json
{
  "code": "docs123",
  "shortUrl": "http://localhost:3000/docs123",
  "originalUrl": "https://example.com/some/long/path",
  "ttlSeconds": 3600
}
```

### `GET /:code`

Resolves the short code and redirects to the original URL.

## Scripts

- `npm run dev`: Start the app in watch mode
- `npm run build`: Compile TypeScript to `dist/`
- `npm start`: Run the compiled app
- `npm run check`: Type-check the project
- `npm run docker:up`: Build and run the service with Redis via Docker Compose
- `npm run docker:down`: Stop Docker Compose services
