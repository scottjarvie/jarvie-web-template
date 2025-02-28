# Jarvie Web Template

A modern full-stack application template built with Turborepo, featuring a Hono + Bun API backend and Next.js frontend.
The fastest way to start a production-ready SaaS application with built-in support for authentication, storage, database, and AI capabilities.

### API (Backend)

- [Bun](https://bun.sh/) - Optimized runtime with enhanced configuration and performance tuning
- [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database access with repository pattern support
- [Supabase](https://supabase.com/) - Enhanced integration for Auth, Storage, and Database

### Web (Frontend)

- [Next.js](https://nextjs.org/) - React framework with App Router for modern web applications
- [Tailwind CSS v4](https://tailwindcss.com/) - Utility-first CSS framework with mobile-first responsive design, dark mode support, and OKLCH color system
- [Shadcn/ui](https://ui.shadcn.com/) - High-quality UI components built with Radix UI and Tailwind CSS
- [Clerk](https://clerk.com/) (with optional Supabase Auth integration) - Complete authentication and user management

### Deployment

- [Render](https://render.com/) - Full-stack deployment platform supporting both frontend and backend services

### Misc

- [Ngrok](https://ngrok.com/)

## 📦 Project Structure

```
├── apps/
│   ├── api/         # Bun API backend
│   └── web/         # Next.js frontend
│       ├── src/
│       │   ├── components/   # UI components including shadcn/ui
│       │   │   ├── ui/       # shadcn/ui components
│       │   │   ├── layout/   # Layout components with mobile support
│       │   │   └── examples/ # Example components showcasing best practices
│       │   └── app/         # Next.js App Router pages
│       └── docs/            # Documentation guides for frontend development
└── packages/        # Shared packages, main DB
```

## 🖼️ Storage Options

This template supports multiple storage providers for handling file uploads and storage:

### Supabase Storage

Built-in integration with Supabase Storage for easy file management with access control.

### Backblaze B2 Storage

The template includes a complete integration with Backblaze B2 object storage:

1. **Backend API** - Full implementation of storage operations using AWS S3 SDK
2. **Frontend Hook** - `useBackblazeStorage` hook for easy file operations
3. **File Upload Component** - Reusable component with drag-and-drop support
4. **Test Utility** - Demo page to test your B2 configuration

To use Backblaze B2:

1. Create a Backblaze B2 account and bucket
2. Generate API credentials (Key ID and Application Key)
3. Add the following environment variables to your `.env` file:
   ```
   B2_KEY_ID=your-backblaze-key-id
   B2_KEY_SECRET=your-backblaze-application-key
   B2_BUCKET_NAME=your-bucket-name
   B2_REGION=us-west-002
   B2_ENDPOINT=s3.us-west-002.backblazeb2.com
   ```
4. Use the `/demo/backblaze-test` page to verify your setup

## 🛠️ Setup & Installation

1. **Install dependencies**

pnpm install

2. **Bun Setup**
   You can install bun in a few ways, based on your OS.
   https://bun.sh/docs/installation

```bash
curl -fsSL https://bun.sh/install | bash # for macOS, Linux, and WSL
```

```bash
npm install -g bun
```

```bash
brew install oven-sh/bun/bun # for macOS and Linux
```

3. **Environment Setup**

Create .env files in both apps/api and apps/web:

For `apps/api/.env`:

```
DATABASE_URL=your_database_url
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SIGNING_SECRET=your_clerk_webhook_secret

# Supabase Configuration (if using Supabase)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_STORAGE_BUCKET=uploads
```

For `apps/web/.env`:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_API_URL=your_api_url

# Supabase Configuration (if using Supabase)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

To run migrations and push db schema locally create a `.env` file in `packages/db` and add your database url.

`packages/db/.env`

```
DATABASE_URL=your_database_url
```

4. **Supabase Setup (Any postgres DB will work)**

- Create a new project on [Supabase](https://supabase.com)
- Copy your database url to the .env file
- Run `pnpm db:push` to initialize the database and mess around.
- When ready, run `pnpm db:generate` to generate the schema. And then run `pnpm db:migrate` to apply the schema to the database.
- For advanced Supabase setup (storage, webhooks, etc.), run `pnpm supabase:setup`

5. **Clerk Setup (Optional if using Supabase Auth)**

- Create a new application on [Clerk](https://clerk.com)
- Copy your API keys to the .env file
- Configure your OAuth providers if needed

#### Webhooks

There are webhook setups for both Clerk and Supabase to handle user creation and authentication.
Use this to setup a sync between your auth provider and the user database. Further details can be found in the [api readme](apps/api/README.md).

## Frontend Features

### Responsive Design with Tailwind CSS

This template includes a comprehensive mobile-first approach using Tailwind CSS v4:

1. **Mobile-First Design** - All components are designed for mobile first, then scaled up for larger screens using breakpoint modifiers
2. **Dark Mode Support** - Full dark mode implementation with theme toggle and system preference detection
3. **Responsive Components** - Ready-to-use responsive components like cards, navigation, and layouts
4. **OKLCH Color System** - Modern color system for better visual consistency across devices
5. **Performance Optimized** - Efficient CSS with proper purging and minimal bundle size

Example responsive components:

- Responsive Card Grid
- Mobile Navigation with slide-out drawer
- Adaptive layouts for various screen sizes

See the [Tailwind Guide](apps/web/docs/tailwind-guide.md) for detailed documentation on our Tailwind CSS implementation.

### shadcn/ui Integration

The template includes integration with shadcn/ui, providing:

1. **High-quality UI components** - Built with Radix UI primitives and styled with Tailwind CSS
2. **Customizable components** - Easily adaptable to your brand and design system
3. **Accessibility** - Built with accessibility in mind
4. **Dark mode support** - All components work seamlessly with the theme system

## Supabase Features

This template includes enhanced support for Supabase with:

1. **Auth Integration** - Easily use Supabase Auth with middleware for JWT verification
2. **Storage** - Ready-to-use storage service with signed URLs for secure uploads
3. **Webhook Support** - Sync users between Supabase Auth and your application database
4. **Database Connection** - Fully type-safe database operations with Drizzle ORM
5. **Setup Scripts** - Utilities to help set up your Supabase project (storage buckets, etc.)

## Bun & Drizzle ORM Optimizations

This template is optimized for high performance and developer productivity:

### Bun Optimizations

1. **Server Configuration** - Tuned for maximum performance with connection pooling
2. **Fast Development** - Hot reloading and optimized build process
3. **Environment Setup** - Pre-configured environment variables and type safety
4. **Error Handling** - Comprehensive error capture and logging

### Drizzle ORM Features

1. **Repository Pattern** - Clean separation of database logic with type-safe repositories
2. **Migration Management** - Robust tools for schema migrations and validation
3. **Schema Tools** - Utilities for validating schema consistency
4. **Query Builders** - Type-safe utilities for building complex queries
5. **Performance** - Optimized database clients with connection pooling

### Database Commands

```bash
# Run migrations
pnpm db:migrate

# Push schema changes directly to database
pnpm db:push

# Generate migration files from schema changes
pnpm db:generate

# Visual database explorer
pnpm db:studio

# Validate schema matches database
pnpm db:validate

# Reset database (drop and recreate)
pnpm db:reset

# Set up Supabase resources
pnpm supabase:setup
```

## Development

Run the development server:

`turbo dev`

This will start both the API and web applications in development mode:

- API: http://localhost:3004
- Web: http://localhost:3000

## 📤 Deployment on Render

This template is configured for easy deployment on Render using the Blueprint feature, which allows you to deploy both the frontend and backend services together.

### Deployment Options

#### Option 1: Using Render Blueprint (Recommended)

1. **Connect your repository to Render**:

   - Sign in to Render and go to the Dashboard
   - Click "New" and select "Blueprint"
   - Connect your GitHub/GitLab repository

2. **Deploy the Blueprint**:

   - Render will automatically detect the `render.yaml` file in your repository
   - Review the services defined in the blueprint
   - Click "Apply Blueprint" to deploy all services

3. **Configure Environment Variables**:
   - Each service will have environment variables partially configured from the blueprint
   - Add any missing environment variables through the Render dashboard

#### Option 2: Manual Deployment

You can also deploy each service individually:

1. **Backend API**:

   - Create a new Web Service in Render
   - Connect your repository
   - Set the build command: `npm install -g pnpm && pnpm install --no-frozen-lockfile`
   - Set the start command: `cd apps/api && bun run src/index.ts`
   - Set environment variables as needed

2. **Frontend Web**:
   - Create another Web Service in Render
   - Connect your repository
   - Set the build command: `npm install -g pnpm && pnpm install --no-frozen-lockfile && cd apps/web && pnpm build`
   - Set the start command: `cd apps/web && pnpm start`
   - Set environment variables as needed

### Important Environment Variables

Make sure to set the following key environment variables in your Render dashboard:

**For Backend API**:

- `DATABASE_URL`: Your PostgreSQL connection string
- `PORT`: Set to 3004
- `BUN_VERSION`: Set to 1.2.3 or your preferred version
- Authentication keys (Clerk/Supabase)

**For Frontend Web**:

- `NEXT_PUBLIC_API_URL`: URL of your deployed backend API service
- Authentication keys (Clerk/Supabase)

### Connecting Frontend and Backend

After deployment, update the `NEXT_PUBLIC_API_URL` environment variable in your frontend service to point to your deployed backend URL.

### Other Deployment Considerations

- **Scaling**: Start with the Free tier and upgrade based on your needs
- **DNS Configuration**: Set up custom domains for your services in the Render dashboard
- **Continuous Deployment**: Render automatically deploys on pushes to your main branch
- **Logs and Monitoring**: Use Render's built-in logging for troubleshooting

## Contributing

1. Create a new branch
2. Make your changes
3. Submit a pull request

# Full-Stack Template Enhancement Project

the goal is to create a super template to start projects using tools i almost always use.
Below is a list of tasks we need to do in order to prepare this template to be coordinated.
I have already done much of the work on another project and can share what worked from there in order to update our template repository here.

## Getting Started Quickly

1. Clone this template
   ```bash
   git clone https://github.com/yourusername/jarvie-web-template.git my-new-project
   cd my-new-project
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env` in the root directory, then to each app and package requiring it
   ```bash
   cp .env.example .env
   cp .env.example apps/api/.env
   cp .env.example apps/web/.env
   cp .env.example packages/db/.env
   ```

4. Update each `.env` file with your specific credentials

5. Start development
   ```bash
   pnpm dev
   ```

## To-Do List

- [x] Double-check existing Supabase integration
- [x] Optimize Bun runtime configuration
- [x] Enhance Drizzle ORM setup and documentation
- [ ] Verify Ngrok setup
- [x] Configure Tailwind CSS properly
  - [x] Mobile-first responsive design
  - [x] Dark mode implementation
  - [x] shadcn/ui integration
  - [x] Example responsive components
  - [x] Tailwind usage documentation
- [x] Add Render deployment configuration (frontend & backend)
- [x] Integrate OpenAI package (GPT-4o and 4o-mini support)
- [x] Add Tiktoken integration
- [x] Set up Backblaze storage
- [x] Update documentation with comprehensive setup instructions
- [ ] Add standardized API documentation
- [ ] Complete CRUD example in frontend
- [ ] Add automated tests
- [ ] Create setup scripts for new projects

## Project Overview

This template provides a starting point for full-stack applications with modern tooling and services pre-configured.

## OpenAI Integration

This template includes OpenAI API integration with support for GPT-4o and GPT-4o-mini models:

1. **Chat Completions** - Create chat completions with various models
2. **Token Counting** - Count tokens in text and chat messages using Tiktoken
3. **Model Information** - Get available models
4. **UI Components** - Ready-to-use React components for token visualization

### OpenAI Features

- **Type-safe API Client** - Fully typed API client for OpenAI integration
- **Tiktoken Integration** - Accurate token counting with OpenAI's official tokenizer
- **Reusable Components** - Ready-to-use React components for token counting and visualization
- **Example Implementation** - Complete example page at `/examples/token-counter`

### OpenAI API Endpoints

| Endpoint                     | Method | Description                   |
| ---------------------------- | ------ | ----------------------------- |
| `/api/openai/chat`           | POST   | Create a chat completion      |
| `/api/openai/tokens`         | POST   | Count tokens in text          |
| `/api/openai/message-tokens` | POST   | Count tokens in chat messages |
| `/api/openai/models`         | GET    | Get available models          |

### Environment Configuration

Make sure to add your OpenAI API key to your environment variables:

```
OPENAI_API_KEY=your-openai-api-key
```

For detailed documentation, see the [OpenAI Integration Guide](apps/web/docs/openai-integration.md).
