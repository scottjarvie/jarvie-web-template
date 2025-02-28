# Setup Guide

This document provides step-by-step instructions for setting up your project using the Jarvie Web Template.

## Prerequisites

- Node.js v22+ (LTS recommended)
- [pnpm](https://pnpm.io/installation) v9.0.0+
- [Bun](https://bun.sh/docs/installation) runtime
- PostgreSQL database (or Supabase account)

## Initial Setup

1. Clone the template repository
   ```bash
   git clone https://github.com/yourusername/jarvie-web-template.git my-new-project
   cd my-new-project
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables

   Copy the `.env.example` file to the following locations:
   ```bash
   cp .env.example .env
   cp .env.example apps/api/.env
   cp .env.example apps/web/.env
   cp .env.example packages/db/.env
   ```

   Update each file with your specific credentials.

## Database Setup

### Option 1: Supabase (Recommended)

1. Create a new project on [Supabase](https://supabase.com)
2. Copy your database credentials to the `.env` files:
   ```
   DATABASE_URL=postgresql://postgres:your-password@db.your-project.supabase.co:5432/postgres
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   SUPABASE_STORAGE_BUCKET=uploads
   ```

3. Run the initial database setup:
   ```bash
   pnpm db:push
   ```

4. If you need Supabase storage and webhook setup, run:
   ```bash
   pnpm supabase:setup
   ```

### Option 2: Local PostgreSQL

1. Set up a local PostgreSQL instance
2. Create a new database for your project
3. Update your `.env` files with the local connection string:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/dbname
   ```

4. Run the initial database setup:
   ```bash
   pnpm db:push
   ```

## Authentication Setup

### Option 1: Clerk (Default)

1. Create a new application on [Clerk](https://clerk.com)
2. Configure your authentication settings and OAuth providers
3. Copy your API keys to the `.env` files:
   ```
   CLERK_SECRET_KEY=your-clerk-secret
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SIGNING_SECRET=your-clerk-webhook-secret
   ```

### Option 2: Supabase Auth

If you prefer using Supabase Auth instead of Clerk:

1. In Supabase dashboard, go to Authentication > Settings
2. Configure your auth providers and settings
3. Update the authentication middleware in your app (see [Authentication Guide](docs/auth-guide.md))

## Storage Setup

### Option 1: Supabase Storage

This is automatically configured if you're using Supabase. No additional setup is needed.

### Option 2: Backblaze B2

1. Create a Backblaze B2 account at [backblaze.com](https://www.backblaze.com/)
2. Create a new bucket with public access
3. Generate API credentials (Key ID and Application Key)
4. Update your `.env` files:
   ```
   B2_KEY_ID=your-backblaze-key-id
   B2_KEY_SECRET=your-backblaze-application-key
   B2_BUCKET_NAME=your-bucket-name
   B2_REGION=us-west-002
   B2_ENDPOINT=s3.us-west-002.backblazeb2.com
   ```

## OpenAI Integration

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add it to your `.env` files:
   ```
   OPENAI_API_KEY=your-openai-api-key
   OPENAI_DEFAULT_MODEL=gpt-4o
   ```

## Development Workflow

1. Start the development servers:
   ```bash
   pnpm dev
   ```

2. Access your applications:
   - Frontend: http://localhost:3000
   - API: http://localhost:3004

## Customizing Your Project

1. Update project name in `package.json` files
2. Customize the theme in `apps/web/tailwind.config.js`
3. Modify database schema in `packages/db/src/schema.ts`
4. Add new API routes in `apps/api/src/modules/`

## Deployment

Follow the [deployment guide](README.md#deployment) for instructions on deploying your application to Render.

## Additional Resources

- [Hono Documentation](https://hono.dev/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Supabase Documentation](https://supabase.com/docs)
- [Clerk Documentation](https://clerk.com/docs)