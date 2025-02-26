# Database Package

This package provides a type-safe database layer using Drizzle ORM with PostgreSQL.

## Features

- Type-safe database schema and queries
- Repository pattern for clean data access
- Migration management
- Utility functions for common operations
- Supabase integration

## Getting Started

### Environment Setup

Create a `.env` file in the `packages/db` directory:

```bash
DATABASE_URL="postgres://postgres:postgres@localhost:5432/your_database"
```

### Basic Usage

```typescript
import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";

// Query all users
const allUsers = await db.select().from(users);

// Find user by ID
const user = await db
  .select()
  .from(users)
  .where(eq(users.userId, "user_123"))
  .limit(1);

// Create a new user
await db.insert(users).values({
  userId: "user_456",
  email: "user@example.com",
});
```

### Using Repositories

For more complex operations, use the repository pattern:

```typescript
import { userRepository } from "@repo/db/repositories/user-repository";

// Find user by email
const user = await userRepository.findByEmail("user@example.com");

// Create a new user
const newUser = await userRepository.create({
  userId: "user_789",
  email: "new@example.com",
});
```

## Schema Management

### Creating Tables

When creating new tables, follow these patterns:

```typescript
// In schema.ts or a domain-specific schema file
import {
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/pg-core";
import { newId } from "@repo/id";
import { lifecycleDates } from "./util/lifecycle-dates";

export const myTable = pgTable("my_table", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => newId("my")),
  name: text("name").notNull(),
  description: text("description"),
  active: boolean("active").default(true),
  ...lifecycleDates,
});
```

### Migrations

Use the following commands to manage migrations:

```bash
# Generate migration files from schema changes
pnpm db:generate

# Apply migrations to database
pnpm db:migrate

# Push schema changes directly (dev only)
pnpm db:push

# Validate schema against database
pnpm db:validate
```

## Query Utilities

### Search

Use the type-safe search utilities:

```typescript
import { buildSearchQuery, ilike } from "@repo/db/utils/query-builders";

// Full-text search across multiple columns
const results = await db
  .select()
  .from(posts)
  .where(buildSearchQuery("search term", [posts.title, posts.content]));

// Case-insensitive partial matching
const users = await db.select().from(users).where(ilike(users.email, "gmail"));
```

### Pagination

For paginated results:

```typescript
import { getPaginationParams } from "@repo/db/utils/query-builders";

const { limit, offset } = getPaginationParams(page, pageSize);

const results = await db.select().from(posts).limit(limit).offset(offset);
```

## Advanced Features

### Transaction Support

```typescript
import { db } from "@repo/db";

await db.transaction(async (tx) => {
  await tx
    .insert(users)
    .values({ userId: "user_1", email: "test@example.com" });
  await tx.insert(posts).values({
    id: "post_1",
    title: "Hello",
    userId: "user_1",
    content: "World",
  });
});
```

### Joins

```typescript
import { db, users, posts } from "@repo/db";
import { eq } from "drizzle-orm";

const userWithPosts = await db
  .select({
    userId: users.userId,
    email: users.email,
    postId: posts.id,
    postTitle: posts.title,
  })
  .from(users)
  .leftJoin(posts, eq(users.userId, posts.userId))
  .where(eq(users.userId, "user_123"));
```

## Supabase Integration

This package includes utilities for working with Supabase:

```typescript
import { supabase } from "@repo/db";
import { syncSupabaseUser } from "@repo/db/supabase-sync";

// Sync a Supabase user to our database
await syncSupabaseUser({
  id: "supabase_user_id",
  email: "user@example.com",
});
```
