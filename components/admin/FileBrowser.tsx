"use client";

import { useState, useEffect, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

interface StorageObject {
  id: string;
  filename: string;
  r2_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  is_public: boolean;
  access_level: string;
  file_type: string | null;
  created_at: string;
  uploaded_by: string | null;
  project_id: string | null;
  projects?: {
    title: string;
    client_id: string;
  } | null;
  uploader?: {
    display_name: string;
  } | null;
}

interface FileBrowserProps {
  projectId?: string;
  clientId?: string;
  fileType?: string;
  className?: string;
}

export default function AdminFileBrowser({
  projectId,
  clientId,
  fileType,
  className = "",
}: FileBrowserProps) {
  const { supabase, role } = useSupabase();
  const [files, setFiles] = useState<StorageObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  
  // Filters
  const [filterType, setFilterType] = useState<string>(fileType || 'all');
  const [filterAccess, setFilterAccess] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'filename' | 'size_bytes'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchFiles = useCallback(async () => {
    if (!['admin', 'team'].includes(role || '')) {
      setError('Access denied');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('storage_objects')
        .select(`
          *,
          projects (title, client_id),
          uploader:profiles!uploaded_by (display_name)
        `)
        .order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply filters
      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (clientId) {
        query = query.eq('client_id', clientId);
      }
      if (filterType && filterType !== 'all') {
        query = query.eq('file_type', filterType);
      }
      if (filterAccess && filterAccess !== 'all') {
        query = query.eq('access_level', filterAccess);
      }
      if (searchQuery) {
        query = query.ilike('filename', `%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query.limit(100);

      if (fetchError) throw fetchError;
      setFiles(data || []);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, [supabase, role, projectId, clientId, filterType, filterAccess, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDownload = async (file: StorageObject) => {
    setDownloadingId(file.id);
    
    try {
      const response = await fetch(`/api/download/${file.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      
      const { url } = await response.json();
      
      // Open in new tab or trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to download file');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (fileIds: string[]) => {
    if (!confirm(`Delete ${fileIds.length} file(s)? This cannot be undone.`)) {
      return;
    }

    try {
      // TODO: Implement delete endpoint
      // For now, just remove from UI
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
      setSelectedFiles(new Set());
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete files');
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedFiles(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFiles.size === files.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(files.map(f => f.id)));
    }
  };

  const formatBytes = (bytes: number | null): string => {
    if (!bytes) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (mimeType: string | null) => {
    if (mimeType?.startsWith('image/')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      );
    }
    if (mimeType?.startsWith('video/')) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
      </svg>
    );
  };

  const getAccessBadge = (accessLevel: string, isPublic: boolean) => {
    if (isPublic) {
      return (
        <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
          Public
        </span>
      );
    }
    const colors: Record<string, string> = {
      'private': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      'team': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      'client': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    };
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[accessLevel] || colors['private']}`}>
        {accessLevel.charAt(0).toUpperCase() + accessLevel.slice(1)}
      </span>
    );
  };

  if (!['admin', 'team'].includes(role || '')) {
    return (
      <div className={`p-6 bg-red-50 dark:bg-red-900/20 rounded-lg text-center ${className}`}>
        <p className="text-red-600 dark:text-red-400">Access denied. Admin or team role required.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Types</option>
            <option value="raw">Raw</option>
            <option value="deliverable">Deliverable</option>
            <option value="transcode">Transcode</option>
            <option value="asset">Asset</option>
          </select>

          <select
            value={filterAccess}
            onChange={(e) => setFilterAccess(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Access</option>
            <option value="public">Public</option>
            <option value="client">Client</option>
            <option value="team">Team</option>
            <option value="private">Private</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as typeof sortBy);
              setSortOrder(order as typeof sortOrder);
            }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="filename-asc">Name A-Z</option>
            <option value="filename-desc">Name Z-A</option>
            <option value="size_bytes-desc">Largest First</option>
            <option value="size_bytes-asc">Smallest First</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedFiles.size > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => handleDelete(Array.from(selectedFiles))}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg"
            >
              Delete ({selectedFiles.size})
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Files Table */}
      {!loading && files.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedFiles.size === files.length && files.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 dark:border-gray-600"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  File
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Project
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Access
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Uploaded
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {files.map((file) => (
                <tr 
                  key={file.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    selectedFiles.has(file.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      onChange={() => toggleSelect(file.id)}
                      className="rounded border-gray-300 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="shrink-0 text-gray-400">
                        {getFileIcon(file.mime_type)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                          {file.filename}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {file.r2_path}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {file.projects?.title || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {formatBytes(file.size_bytes)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {getAccessBadge(file.access_level, file.is_public)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(file.created_at)}
                    </div>
                    {file.uploader && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        by {file.uploader.display_name}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => handleDownload(file)}
                      disabled={downloadingId === file.id}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium
                                 text-blue-600 hover:text-blue-700 dark:text-blue-400
                                 disabled:opacity-50 disabled:cursor-wait"
                    >
                      {downloadingId === file.id ? (
                        <span className="animate-spin mr-1">⏳</span>
                      ) : (
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      )}
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {!loading && files.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No files</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchQuery || filterType !== 'all' || filterAccess !== 'all'
              ? 'No files match your filters.'
              : 'Upload your first file to get started.'
            }
          </p>
        </div>
      )}

      {/* File Count */}
      {!loading && files.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
          Showing {files.length} file{files.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
