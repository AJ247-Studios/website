"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";

type FileRecord = {
  id: string;
  user_id: string | null;
  filename: string;
  mime_type: string;
  size: number;
  url: string;
  bucket: string;
  created_at: string;
};

/**
 * Client Files Page
 * 
 * Protected by middleware - only accessible to authenticated users.
 * Displays files uploaded by the current user.
 */
export default function ClientFilesPage() {
  const { supabase, session } = useSupabase();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Show "session expired" option after 2 seconds of loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSessionExpired(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSessionExpired(false);
    }
  }, [loading]);

  // Function to clear cookies and redirect to login
  const handleClearSession = () => {
    // Clear all Supabase cookies by setting them to expire
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName.startsWith("sb-")) {
        // Clear with multiple path variants to ensure removal
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      }
    }
    // Force a hard redirect to clear any cached state
    window.location.href = "/login";
  };

  // Redirect if not authenticated (with delay to allow hydration)
  useEffect(() => {
    if (session === null) {
      // Small delay to ensure we're not redirecting during hydration
      const timer = setTimeout(() => {
        router.push("/login?redirect=/client/files");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  // Load files when session is available
  useEffect(() => {
    const loadFiles = async () => {
      if (!session?.user?.id) return;
      
      try {
        const { data, error: fetchError } = await supabase
          .from("files")
          .select("id, user_id, filename, mime_type, size, url, bucket, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setFiles((data || []) as FileRecord[]);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load files");
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      loadFiles();
    } else {
      // No session - stop loading (redirect will happen)
      setLoading(false);
    }
  }, [session, supabase]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading your files…</p>
          {showSessionExpired && (
            <div className="mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Taking too long? Your session may have expired.
              </p>
              <button
                onClick={handleClearSession}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm font-medium"
              >
                Click here to re-login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Files</h1>
      {files.length === 0 ? (
        <p className="text-gray-600">No files yet. Upload from your portal.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {files.map((f) => (
            <li key={f.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
              <div className="font-medium break-all">{f.filename}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{f.mime_type}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{new Date(f.created_at).toLocaleString()}</div>
              <a
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View / Download
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
