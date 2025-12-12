"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import PresignedUploadForm from "@/components/PresignedUploadForm";
import AdminFileBrowser from "@/components/admin/FileBrowser";

export default function UploadPage() {
  const { session, role, isLoading } = useSupabase();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upload' | 'browse'>('upload');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const { supabase } = useSupabase();

  // Fetch projects for the selector
  useEffect(() => {
    async function fetchProjects() {
      if (!['admin', 'team'].includes(role || '')) return;
      
      const { data } = await supabase
        .from('projects')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(50);
      
      setProjects(data || []);
    }
    
    if (role) {
      fetchProjects();
    }
  }, [supabase, role]);

  // Redirect if not authenticated or not admin/team
  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login?redirect=/admin/upload");
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!['admin', 'team'].includes(role || '')) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 dark:text-gray-400">
          You need admin or team permissions to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Media Management
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload files and manage project media
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'upload'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Upload Files
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-4 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'browse'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Browse Files
          </button>
        </nav>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Files
              </h2>
              
              {/* Project Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Project (optional)
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">No project selected</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <PresignedUploadForm
                projectId={selectedProjectId || undefined}
                allowedFileTypes={['raw', 'deliverable', 'team-wip', 'portfolio', 'public-asset']}
                onUploadComplete={(result) => {
                  console.log('Upload complete:', result);
                }}
                onUploadError={(error) => {
                  console.error('Upload error:', error);
                }}
              />
            </div>
          </div>

          {/* Upload Guidelines */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Upload Guidelines
              </h3>
              
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Raw Files</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Original footage up to 5GB. Kept private.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Deliverables</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Final files for clients up to 1GB. Clients can access.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Work in Progress</h4>
                  <p className="text-gray-500 dark:text-gray-400">
                    Team-only files up to 2GB.
                  </p>
                </div>
                
                {role === 'admin' && (
                  <>
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Portfolio</h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        Public showcase items up to 500MB.
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">Website Assets</h4>
                      <p className="text-gray-500 dark:text-gray-400">
                        Public site images up to 50MB.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Supported Formats
                </h4>
                <div className="flex flex-wrap gap-2">
                  {['MP4', 'MOV', 'WEBM', 'JPG', 'PNG', 'WEBP', 'PDF', 'ZIP'].map((format) => (
                    <span
                      key={format}
                      className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                    >
                      {format}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Browse Tab */}
      {activeTab === 'browse' && (
        <AdminFileBrowser />
      )}
    </div>
  );
}
