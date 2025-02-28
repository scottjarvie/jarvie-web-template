# CLAUDE.md - Project Guide

## Build & Development Commands
- `pnpm dev` - Run development server for all apps
- `pnpm build` - Build all apps
- `pnpm lint` - Run linting on all apps
- `pnpm format` - Format code with Biome
- `pnpm check-types` - Run TypeScript type checking
- `vitest run` - Run all tests (in packages)
- `vitest run [path-to-test]` - Run specific test

## Database Commands
- `pnpm db:push` - Push schema changes
- `pnpm db:generate` - Generate migrations
- `pnpm db:studio` - Open database UI

## Code Style Guidelines
- **Formatting**: Use Biome (100 chars line width, double quotes, space indentation)
- **Imports**: Third-party first, internal second, grouped by source
- **Naming**: 
  - camelCase for variables/functions, PascalCase for components/types
  - Kebab-case for files/folders
- **Types**: Prefer interfaces, export from schema, explicit return types
- **Components**: Function-based with hooks, "use client" directive on top
- **Error Handling**: Try/catch with standardized error objects
- **API Patterns**: RESTful routes in Hono, zod for validation

## Git Workflow
- Create feature branches from main
- Use descriptive commit messages
- Run typechecking before committing