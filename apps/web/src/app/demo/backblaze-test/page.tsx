"use client";

/**
 * Backblaze B2 Storage Test Page
 * 
 * A utility page to test Backblaze B2 storage integration.
 * Tests file uploads, downloads, listing, and deletion.
 */

import React, { useState, useEffect } from "react";
import { useBackblazeStorage } from "@/hooks/use-backblaze-storage";
import { FileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, AlertTriangle } from "lucide-react";

interface TestResult {
  name: string;
  result: boolean | null;
}

export default function BackblazeTestPage() {
  const { uploadFile, deleteFile, fileExists, listFiles } = useBackblazeStorage();
  const [testResults, setTestResults] = useState<{
    upload: boolean | null;
    delete: boolean | null;
    exists: boolean | null;
    list: boolean | null;
  }>({
    upload: null,
    delete: null,
    exists: null,
    list: null,
  });
  const [uploadedFile, setUploadedFile] = useState<{ url: string; key: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleUploadComplete = (url: string, key: string) => {
    setUploadedFile({ url, key });
    setTestResults(prev => ({ ...prev, upload: true }));
    
    // Test file exists
    testFileExists(key);
    
    // Test list files
    testListFiles(key);
  };

  const testFileExists = async (key: string) => {
    try {
      const exists = await fileExists(key);
      setTestResults(prev => ({ ...prev, exists }));
    } catch (err) {
      setError("Error checking if file exists");
    }
  };

  const testListFiles = async (key: string) => {
    try {
      const files = await listFiles();
      const fileFound = files.some((file: any) => file.Key === key);
      setTestResults(prev => ({ ...prev, list: fileFound }));
    } catch (err) {
      setError("Error listing files");
    }
  };

  const handleDeleteTest = async () => {
    if (!uploadedFile) return;
    
    setLoading(true);
    try {
      const success = await deleteFile(uploadedFile.key);
      setTestResults(prev => ({ ...prev, delete: success }));
      
      if (success) {
        // Verify file no longer exists
        const exists = await fileExists(uploadedFile.key);
        if (!exists) {
          setUploadedFile(null);
        }
      }
    } catch (err) {
      setError("Failed to delete file");
    } finally {
      setLoading(false);
    }
  };

  function TestResultRow({ name, result }: { name: string; result: boolean | null }) {
    return (
      <div className="flex items-center gap-2 p-2 border-b">
        {result === null ? (
          <div className="h-5 w-5 rounded-full bg-gray-200" />
        ) : result ? (
          <Check className="h-5 w-5 text-green-500" />
        ) : (
          <X className="h-5 w-5 text-red-500" />
        )}
        <span>{name}</span>
        <span className="ml-auto">
          {result === null ? (
            "Not tested"
          ) : result ? (
            <span className="text-green-500 font-medium">Pass</span>
          ) : (
            <span className="text-red-500 font-medium">Fail</span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Backblaze B2 Integration Test</CardTitle>
          <CardDescription>
            This utility tests your Backblaze B2 integration to ensure uploads, downloads, 
            and deletions are working properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="mb-6">
            <FileUpload 
              onUploadComplete={handleUploadComplete}
              accept="image/*,application/pdf"
              maxSize={10}
            />
          </div>
          
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
              <AlertTriangle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Error</p>
                <p>{error}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Test Results</h3>
            
            <div className="border rounded-lg overflow-hidden">
              <TestResultRow name="File Upload" result={testResults.upload} />
              <TestResultRow name="File Exists" result={testResults.exists} />
              <TestResultRow name="List Files" result={testResults.list} />
              <TestResultRow name="File Delete" result={testResults.delete} />
            </div>
          </div>
          
          {uploadedFile && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Uploaded Test File</h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <p><strong>URL:</strong> <a href={uploadedFile.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline truncate block">{uploadedFile.url}</a></p>
                <p><strong>Key:</strong> <span className="font-mono text-sm break-all">{uploadedFile.key}</span></p>
                
                <div className="pt-4">
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteTest}
                    disabled={loading || testResults.delete === true}
                  >
                    {loading ? "Deleting..." : "Test File Deletion"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 