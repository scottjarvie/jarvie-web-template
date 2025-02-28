# Authentication Guide

This template provides two authentication options: Clerk (default) and Supabase Auth. This guide explains how to use each one and how to switch between them.

## Clerk Authentication (Default)

The template is configured to use Clerk as the default authentication provider.

### How Clerk is Integrated

1. **Frontend Integration**:
   - Clerk provides the `<ClerkProvider>` in `src/providers/providers.tsx`
   - Sign-in/sign-up pages are defined in `src/app/(auth)/`
   - Auth state is accessed via Clerk hooks: `useAuth()`, `useUser()`

2. **Backend Integration**:
   - The API uses Clerk middleware in `src/pkg/middleware/clerk-auth.ts`
   - The middleware validates JWT tokens from the client
   - User information is extracted from the verified token

### Clerk Configuration

1. Set up your Clerk application at [clerk.com](https://clerk.com)
2. Configure your OAuth providers (Google, GitHub, etc.)
3. Update your `.env` files with Clerk credentials:
   ```
   CLERK_SECRET_KEY=your-clerk-secret
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
   CLERK_SIGNING_SECRET=your-clerk-webhook-secret
   ```

### Using Clerk in Components

```tsx
"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export function MyProtectedComponent() {
  const { isLoaded, userId, sessionId } = useAuth();
  const { user } = useUser();
  
  if (!isLoaded || !userId) {
    return <div>Loading or not authenticated...</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Your user ID is: {userId}</p>
    </div>
  );
}
```

## Supabase Authentication (Alternative)

The template also includes Supabase Auth as an alternative authentication method.

### How Supabase Auth is Integrated

1. **Frontend Integration**:
   - Supabase client is initialized in `src/providers/supabase-provider.tsx`
   - Auth state can be accessed via the Supabase client

2. **Backend Integration**:
   - The API has a Supabase auth middleware in `src/pkg/middleware/supabase-auth.ts`
   - The middleware validates JWT tokens from Supabase
   - User information is extracted from the verified token

### Switching to Supabase Auth

1. Update your environment variables with Supabase credentials:
   ```
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Modify the API middleware in `apps/api/src/index.ts`:
   ```typescript
   // Replace Clerk auth middleware with Supabase auth middleware
   import { supabaseAuth } from "@/pkg/middleware/supabase-auth";
   
   // In your routes definition
   const routes = app
     .basePath("/api")
     .use("*", errorHandler())
     .use("/protected/*", supabaseAuth()) // Add this line
     // ... other routes
   ```

3. Update frontend authentication in `apps/web/src/middleware.ts`:
   ```typescript
   // Comment out or remove Clerk middleware
   // export default authMiddleware({...});
   
   // Add your Supabase auth middleware if needed
   ```

4. Use Supabase auth in components:
   ```tsx
   "use client";
   
   import { useSupabase } from "@/providers/supabase-provider";
   
   export function MyProtectedComponent() {
     const { supabase, session } = useSupabase();
     
     if (!session) {
       return <div>Not authenticated...</div>;
     }
     
     return (
       <div>
         <h1>Welcome, {session.user.email}!</h1>
         <p>Your user ID is: {session.user.id}</p>
       </div>
     );
   }
   ```

## Authentication Webhooks

Both authentication providers support webhooks to synchronize user data with your application database.

### Clerk Webhooks

Configure Clerk webhooks at [clerk.com/dashboard](https://clerk.com/dashboard) to point to:
```
https://your-api-url.com/api/webhooks/clerk
```

The webhook handler is defined in `apps/api/src/modules/webhooks/webhook.routes.ts`.

### Supabase Webhooks

Supabase webhooks are automatically handled through database triggers. The webhook endpoint is:
```
https://your-api-url.com/api/webhooks/supabase
```

The webhook handler is defined in `apps/api/src/modules/webhooks/supabase-webhook.routes.ts`.

## Best Practices

1. **Consistent Auth State**: Use the auth provider's hooks consistently throughout your application
2. **Protected Routes**: Use middleware to protect routes on both frontend and backend
3. **Error Handling**: Implement proper error handling for authentication failures
4. **Token Management**: Be careful with token storage and transmission
5. **User Data Sync**: Ensure user data is properly synchronized between auth provider and your database