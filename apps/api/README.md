# API Backend

This is the API backend for the B(build)stack template, built with Hono and Bun.

## Features

- High-performance Bun runtime
- Modular Hono middleware architecture
- Type-safe API endpoints
- Comprehensive error handling
- Structured logging
- Authentication with Supabase and/or Clerk
- Webhook handling
- File storage with Supabase
- Database access with Drizzle ORM

## Getting Started

### Environment Setup

Create a `.env` file in the `apps/api` directory:

```bash
# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/your_database

# Server config
PORT=3004
NODE_ENV=development

# Supabase Configuration (if using Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=uploads

# Backblaze B2 Configuration (if using Backblaze)
B2_KEY_ID=your-backblaze-key-id
B2_KEY_SECRET=your-backblaze-application-key
B2_BUCKET_NAME=your-bucket-name
B2_REGION=us-west-002
B2_ENDPOINT=s3.us-west-002.backblazeb2.com

# Clerk Configuration (if using Clerk)
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_SIGNING_SECRET=your_clerk_webhook_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### Development

Run the development server:

```bash
bun run dev
```

This will start the API server with hot reload at http://localhost:3004.

### Testing Endpoints

Once running, you can test the health endpoint:

```bash
curl http://localhost:3004/health
```

## Project Structure

```
apps/api/
├── src/
│   ├── index.ts              # Main entry point
│   ├── modules/              # Feature modules
│   │   ├── posts/            # Posts module
│   │   ├── storage/          # Storage module
│   │   └── webhooks/         # Webhook handlers
│   └── pkg/                  # Shared packages
│       ├── middleware/       # Hono middleware
│       ├── services/         # Services (storage, etc.)
│       └── util/             # Utility functions
```

## Bun Optimizations

This project takes advantage of several Bun-specific optimizations:

### Performance Tuning

The Bun server is configured with:

- Connection pooling
- Increased idle timeout
- Configurable request body size limits
- Development mode detection

### Hot Reloading

The development server uses Bun's built-in hot reloading:

```bash
bun run --hot src/index.ts
```

### Type Safety

All code is fully typed, with TypeScript types for:

- API routes and handlers
- Request and response bodies
- Environment variables

### Error Handling

The API includes comprehensive error handling:

- Global error middleware
- Structured error responses
- Request logging
- Not found handling

## Creating New Routes

To add a new API endpoint:

1. Create a new module in `src/modules/your-feature/`
2. Add route file `your-feature.routes.ts`
3. Register the routes in `src/index.ts`

Example route file:

```typescript
import { Hono } from "hono";
import { zValidator } from "@/pkg/util/validator-wrapper";
import { z } from "zod";
import { auth, requireAuth } from "@/pkg/middleware/supabase-auth";

// Validation schema
const createItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

// Create a new Hono router
export const itemRoutes = new Hono()
  .use(auth())

  // Get all items
  .get("/", async (c) => {
    // Implementation here
    return c.json({ items: [] });
  })

  // Create a new item
  .post("/", requireAuth, zValidator("json", createItemSchema), async (c) => {
    const data = c.req.valid("json");
    // Implementation here
    return c.json({ success: true }, 201);
  });
```

## Webhook Handlers

The API includes webhook handlers for both Supabase and Clerk. These are used to sync users between your authentication provider and your application database.

### Supabase Webhooks

Endpoint: `/api/webhooks/supabase`

Handles events like:

- User creation
- User updates
- Auth events

### Clerk Webhooks

Endpoint: `/api/webhooks`

Handles events like:

- User creation
- User updates
- User deletion

## API Modules

### Storage Integration

The API includes storage integrations with multiple providers:

#### Supabase Storage

Built-in integration with Supabase Storage for easy file management with access control.

| Endpoint                              | Method | Description                        |
| ------------------------------------- | ------ | ---------------------------------- |
| `/api/storage/supabase/signed-upload` | POST   | Get a signed URL for direct upload |
| `/api/storage/supabase/public-url`    | GET    | Get a public URL for a file        |
| `/api/storage/supabase/:fileKey`      | DELETE | Delete a file                      |

#### Backblaze B2 Storage

Full implementation of storage operations using AWS S3 SDK:

| Endpoint                                  | Method | Description                            |
| ----------------------------------------- | ------ | -------------------------------------- |
| `/api/storage/backblaze/presigned-upload` | POST   | Get a presigned URL for direct upload  |
| `/api/storage/backblaze/proxy-upload`     | POST   | Upload via server to avoid CORS issues |
| `/api/storage/backblaze/:key`             | DELETE | Delete a file                          |
| `/api/storage/backblaze/exists/:key`      | GET    | Check if a file exists                 |
| `/api/storage/backblaze/list/:prefix?`    | GET    | List files with an optional prefix     |
| `/api/storage/backblaze/public-url/:key`  | GET    | Get a public URL for a file            |

The Backblaze B2 integration:

- Uses AWS S3-compatible API endpoints
- Provides user-scoped storage
- Handles CORS with proxy upload option
- Generates presigned URLs for direct client uploads
- Supports public URL generation

### OpenAI Integration

The API includes a complete OpenAI integration with the following features:

- Chat completions with GPT-4o and GPT-4o-mini models
- Token counting with Tiktoken for accurate estimates
- Message token counting for chat interfaces
- Model information retrieval

#### Endpoints

| Endpoint                     | Method | Description                   |
| ---------------------------- | ------ | ----------------------------- |
| `/api/openai/chat`           | POST   | Create a chat completion      |
| `/api/openai/tokens`         | POST   | Count tokens in text          |
| `/api/openai/message-tokens` | POST   | Count tokens in chat messages |
| `/api/openai/models`         | GET    | Get available models          |

See the [OpenAI Integration Guide](../web/docs/openai-integration.md) for detailed usage information.

## Deployment

### Deployment on Render

This API is configured for deployment on Render using either the Blueprint approach or as a standalone Web Service.

#### Option 1: Using Render Blueprint

The preferred method is using the Render Blueprint, which is defined in the `render.yaml` file at the root of the repository. This approach allows you to deploy both the API and frontend in a single operation.

1. Connect your repository to Render
2. Create a new Blueprint deployment
3. Render will automatically detect and configure the services

#### Option 2: Manual Deployment

To deploy just the API service:

1. Create a new Web Service in Render
2. Connect your repository
3. Configure the service:
   - Build Command: `npm install -g pnpm && pnpm install --no-frozen-lockfile`
   - Start Command: `bun run src/index.ts`
   - Root Directory: `apps/api`
4. Add your environment variables

#### Using Dockerfile

You can also deploy using the Dockerfile provided in this directory:

1. Create a new Web Service in Render
2. Connect your repository
3. Select Docker as the environment
4. Point to the `apps/api/Dockerfile`
5. Add your environment variables

### Key Environment Variables

Make sure to configure these environment variables in your Render dashboard:

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Set to 3004
- `BUN_VERSION`: Set to 1.2.3 or your preferred version
- Authentication keys (Clerk/Supabase)

### Other Platforms

The API can also be deployed on any platform that supports Bun, such as:

- Fly.io
- Railway
- Self-hosted environments
