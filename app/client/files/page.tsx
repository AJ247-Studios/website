"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

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

export default function ClientFilesPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (!userId) {
          setError("Please log in to view your files.");
          setLoading(false);
          return;
        }
        const { data, error } = await supabase
          .from("files")
          .select("id, user_id, filename, mime_type, size, url, bucket, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setFiles((data || []) as FileRecord[]);
        }
      } catch (e: any) {
        setError(e.message || "Failed to load files");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">Loading your files…</div>;
  }
  if (error) {
    return <div className="max-w-4xl mx-auto p-6 text-red-600">{error}</div>;
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
