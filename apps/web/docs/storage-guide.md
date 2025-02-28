# Storage Guide

This template supports two storage options for file uploads and management: Backblaze B2 and Supabase Storage. This guide explains how to use each one.

## Backblaze B2 Storage

Backblaze B2 is a cost-effective S3-compatible object storage service.

### Setup

1. Create a Backblaze B2 account at [backblaze.com](https://www.backblaze.com/)
2. Create a new bucket with public access
3. Create an application key with appropriate permissions
4. Add the following environment variables to your `.env` files:

```
B2_KEY_ID=your-backblaze-key-id
B2_KEY_SECRET=your-backblaze-application-key
B2_BUCKET_NAME=your-bucket-name
B2_REGION=us-west-002  # Your specific region
B2_ENDPOINT=s3.us-west-002.backblazeb2.com  # Your region's endpoint
```

### Backend Implementation

The API includes a complete implementation for Backblaze B2 operations:

- `apps/api/src/pkg/services/backblaze-storage.ts` - Core service for storage operations
- `apps/api/src/modules/storage/backblaze.routes.ts` - API routes for client operations

### Frontend Usage

The template includes a custom React hook for easy file operations:

```tsx
"use client";

import { useBackblazeStorage } from "@/hooks/use-backblaze-storage";

export default function UploadComponent() {
  const { uploadFile, getUrl, isLoading, error } = useBackblazeStorage();

  const handleFileUpload = async (file: File) => {
    try {
      // Upload file and get the file key
      const fileKey = await uploadFile(file);
      
      // Get the public URL for the file
      const publicUrl = await getUrl(fileKey);
      
      console.log("File uploaded:", publicUrl);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
      />
      {isLoading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

### Testing Your Configuration

The template includes a test page at `/demo/backblaze-test` that lets you verify your B2 configuration is working correctly.

## Supabase Storage

Supabase Storage provides an easy-to-use file storage solution integrated with Supabase Auth.

### Setup

Supabase Storage is automatically set up if you're using Supabase. Simply ensure your Supabase environment variables are configured:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_STORAGE_BUCKET=uploads
```

Run the Supabase setup script to ensure the storage bucket exists:

```bash
pnpm supabase:setup
```

### Backend Implementation

The API includes a complete implementation for Supabase Storage operations:

- `apps/api/src/pkg/services/supabase-storage.ts` - Core service for storage operations
- `apps/api/src/modules/storage/storage.routes.ts` - API routes for client operations

### Frontend Usage

You can use the Supabase client directly in your components:

```tsx
"use client";

import { useSupabase } from "@/providers/supabase-provider";

export default function UploadComponent() {
  const { supabase } = useSupabase();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`public/${file.name}`, file);
        
      if (error) throw error;
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(`public/${file.name}`);
        
      console.log("File uploaded:", publicUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} 
      />
      {uploading && <p>Uploading...</p>}
      {error && <p>Error: {error}</p>}
    </div>
  );
}
```

## Reusable File Upload Component

The template includes a reusable file upload component in `apps/web/src/components/ui/file-upload.tsx` that works with both storage options:

```tsx
import { FileUpload } from "@/components/ui/file-upload";

export default function MyPage() {
  const handleUploadSuccess = (fileUrl: string) => {
    console.log("File uploaded:", fileUrl);
  };

  return (
    <FileUpload
      onUploadSuccess={handleUploadSuccess}
      allowedFileTypes={["image/*", ".pdf"]}
      maxSizeMB={5}
    />
  );
}
```

## Best Practices

1. **File Size Limits**: Implement client-side file size validation before uploading
2. **File Types**: Restrict allowed file types to prevent security issues
3. **Presigned URLs**: Use presigned URLs for private files
4. **Folder Structure**: Organize files in logical folders (e.g., by user ID)
5. **Error Handling**: Implement proper error handling and retry logic
6. **Progress Indicators**: Show upload progress for large files
7. **Cleanup**: Implement cleanup logic to remove unused files