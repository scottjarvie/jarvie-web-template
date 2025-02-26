# Next.js Frontend Application

This is the frontend part of the B(build)stack template, built with Next.js, Tailwind CSS v4, and shadcn/ui components.

## Features

- **Next.js App Router**: Modern React framework with server and client components
- **Tailwind CSS v4**: Utility-first CSS with mobile-first responsive design
- **shadcn/ui**: High-quality UI components built with Radix UI and Tailwind
- **Dark Mode**: Complete theme implementation with system preference detection
- **Responsive Design**: Mobile-first approach with comprehensive breakpoint system
- **Authentication**: Clerk integration with user management and profiles
- **API Integration**: Type-safe API client for backend communication

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Set up environment variables in `.env`:

   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_API_URL=your_api_url
   ```

3. Run the development server:

   ```bash
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## File Storage Integration

This template provides components and hooks for working with multiple file storage providers:

### Backblaze B2 Storage

The template includes a complete integration with Backblaze B2 storage:

- **`useBackblazeStorage` Hook**: A React hook for interacting with Backblaze B2 storage
- **`FileUpload` Component**: A reusable drag-and-drop file upload component
- **Backblaze Test Page**: A utility page at `/demo/backblaze-test` to test your storage setup

#### Using the Storage Hook

```tsx
import { useBackblazeStorage } from "@/hooks/use-backblaze-storage";

function MyComponent() {
  const { uploadFile, deleteFile, fileExists, listFiles, uploading } =
    useBackblazeStorage();

  const handleUpload = async (file) => {
    const result = await uploadFile(file);
    if (result) {
      console.log("File uploaded:", result.url);
    }
  };

  return <div>{/* Your component content */}</div>;
}
```

#### Using the File Upload Component

```tsx
import { FileUpload } from "@/components/ui/file-upload";

function MyComponent() {
  const handleUploadComplete = (url, key) => {
    console.log("File uploaded:", url);
    // Do something with the uploaded file
  };

  return (
    <FileUpload
      onUploadComplete={handleUploadComplete}
      accept="image/*,application/pdf"
      maxSize={5} // in MB
    />
  );
}
```

### Environment Variables

To use Backblaze B2 storage, you need to set these backend environment variables:

```
B2_KEY_ID=your-backblaze-key-id
B2_KEY_SECRET=your-backblaze-application-key
B2_BUCKET_NAME=your-bucket-name
B2_REGION=us-west-002
B2_ENDPOINT=s3.us-west-002.backblazeb2.com
```

No additional frontend environment variables are needed as all storage operations go through the API.

## Responsive Design Guide

This template uses a mobile-first approach to responsive design. All components are designed to work on mobile devices first, then scale up for larger screens.

### Key Responsive Features

- **Breakpoint System**: Use Tailwind's breakpoint modifiers (`sm:`, `md:`, `lg:`, `xl:`, `2xl:`) to adapt layouts
- **Mobile Navigation**: Slide-out drawer navigation for small screens
- **Responsive Grid**: Grid system that adjusts columns based on screen size
- **Adaptive Typography**: Text sizes that scale appropriately across devices
- **Dark Mode Support**: Complete dark mode implementation with automatic and manual switching

### Example Components

- **`MobileNav`**: A responsive navigation component with mobile drawer
- **`ResponsiveCard`**: A card component that adapts to different screen sizes
- **`ResponsiveExamplesPage`**: A demo page showcasing various responsive techniques

### Responsive Design Examples

Visit the example page at [/examples/responsive](http://localhost:3000/examples/responsive) to see responsive components in action.

## Theme System

The theme system uses Tailwind's dark mode with the `class` strategy, allowing for:

- **System Preference Detection**: Automatically matches the user's system preference
- **Manual Toggle**: Users can override the system preference with the `ThemeToggle` component
- **Persistent Preference**: User's preference is saved in local storage

### Using Dark Mode

Apply dark mode styles using the `dark:` prefix:

```tsx
<div className="bg-white text-black dark:bg-black dark:text-white">
  This adapts to dark mode
</div>
```

## Component Documentation

For detailed documentation on components and styling patterns, see:

- [Tailwind CSS Implementation Guide](./docs/tailwind-guide.md)
- [shadcn/ui Documentation](https://ui.shadcn.com/)

## Project Structure

```
src/
├── app/
│   ├── (auth)/        # Authentication routes
│   ├── (dashboard)/   # Dashboard routes (protected)
│   └── (marketing)/   # Public marketing pages
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── layout/        # Layout components
│   ├── forms/         # Form components
│   └── examples/      # Example components
├── lib/               # Utility functions and helpers
├── providers/         # React context providers
├── styles/            # Global styles and Tailwind configuration
└── api/               # API client for backend communication
```

## Best Practices

- **Mobile-First Development**: Always design for mobile first, then enhance for larger screens
- **Component Composition**: Build complex UIs by composing smaller components
- **Server vs Client Components**: Use server components when possible to reduce client-side JavaScript
- **Type Safety**: Leverage TypeScript for better development experience and fewer bugs
- **Performance**: Use Next.js image optimization, code splitting, and other performance features
- **Accessibility**: Ensure components are accessible and keyboard navigable

## Deployment

### Deployment on Render

This Next.js application is configured for deployment on Render using either the Blueprint approach or as a standalone Web Service.

#### Option 1: Using Render Blueprint

The preferred method is using the Render Blueprint, which is defined in the `render.yaml` file at the root of the repository. This approach allows you to deploy both the API and frontend in a single operation.

1. Connect your repository to Render
2. Create a new Blueprint deployment
3. Render will automatically detect and configure the services

#### Option 2: Manual Deployment

To deploy just the web application:

1. Create a new Web Service in Render
2. Connect your repository
3. Configure the service:
   - Build Command: `npm install -g pnpm && pnpm install --no-frozen-lockfile && cd apps/web && pnpm build`
   - Start Command: `cd apps/web && pnpm start`
   - Root Directory: Root of the repository (not the web directory, due to workspace dependencies)
4. Add your environment variables

#### Using Dockerfile

You can also deploy using the Dockerfile provided in this directory:

1. Create a new Web Service in Render
2. Connect your repository
3. Select Docker as the environment
4. Point to the `apps/web/Dockerfile`
5. Add your environment variables

### Key Environment Variables

Make sure to configure these environment variables in your Render dashboard:

- `NEXT_PUBLIC_API_URL`: URL of your deployed backend API service
- Authentication keys (Clerk/Supabase)

### Connecting to the Backend

After deployment, ensure that the `NEXT_PUBLIC_API_URL` environment variable in your web service points to your deployed backend URL (usually `https://bstack-api.onrender.com` if you're using the default naming from the Blueprint).
