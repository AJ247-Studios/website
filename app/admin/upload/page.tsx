"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import {
  DragDropZone,
  FileList,
  BatchMetadataEditor,
  PublishModal,
  ProcessingPanel,
  MediaAsset,
  BatchUpdate,
  PublishConfig,
  ProcessingJob,
  SelectedAsset,
} from "@/components/admin";
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  client_id?: string;
}

interface Vault {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
  item_count: number;
}

interface PublishPreset {
  id: string;
  name: string;
  target_type: 'portfolio' | 'vault';
  settings: Record<string, unknown>;
}

type FileType = 'all' | 'raw' | 'deliverable' | 'portfolio' | 'team-wip';
type UploadStatus = 'all' | 'uploading' | 'processing' | 'complete' | 'failed';

export default function UploadPage() {
  const { session, role, isLoading, supabase } = useSupabase();
  const router = useRouter();
  
  // UI State
  const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'processing'>('upload');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FileType>('all');
  const [filterStatus, setFilterStatus] = useState<UploadStatus>('all');
  
  // Data State
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [presets, setPresets] = useState<PublishPreset[]>([]);
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [existingTags, setExistingTags] = useState<string[]>([]);
  
  // Modal State
  const [showMetadataEditor, setShowMetadataEditor] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  // Upload context
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [uploadFileType, setUploadFileType] = useState<'raw' | 'deliverable' | 'portfolio' | 'team-wip'>('deliverable');

  // Fetch data on mount
  useEffect(() => {
    if (!['admin', 'team'].includes(role || '')) return;
    
    async function fetchData() {
      // Fetch clients
      const { data: clientsData } = await supabase
        .from('clients')
        .select('id, name')
        .order('name');
      setClients(clientsData || []);

      // Fetch projects
      const { data: projectsData } = await supabase
        .from('projects')
        .select('id, title, client_id')
        .order('created_at', { ascending: false });
      setProjects(projectsData?.map(p => ({ id: p.id, name: p.title, client_id: p.client_id })) || []);

      // Fetch vaults (joined with clients)
      const { data: vaultsData } = await supabase
        .from('client_vaults')
        .select('id, name, client_id, clients(name)')
        .order('created_at', { ascending: false });
      setVaults(vaultsData?.map(v => {
        // clients can be an object or array depending on the relationship
        const clientData = v.clients as { name: string } | { name: string }[] | null;
        const clientName = Array.isArray(clientData) 
          ? clientData[0]?.name 
          : clientData?.name;
        return {
          id: v.id,
          name: v.name,
          client_id: v.client_id,
          client_name: clientName || 'Unknown',
        };
      }) || []);

      // Fetch collections
      const { data: collectionsData } = await supabase
        .from('portfolio_collections')
        .select('id, name, slug')
        .order('sort_order');
      setCollections(collectionsData?.map(c => ({ ...c, item_count: 0 })) || []);

      // Fetch presets
      const { data: presetsData } = await supabase
        .from('publish_presets')
        .select('id, name, target_type, settings')
        .order('name');
      setPresets(presetsData || []);
    }

    fetchData();
  }, [supabase, role]);

  // Fetch assets
  const fetchAssets = useCallback(async () => {
    if (!['admin', 'team'].includes(role || '')) return;
    
    let query = supabase
      .from('media_assets')
      .select(`
        id,
        filename,
        r2_path,
        mime_type,
        file_size,
        file_type,
        upload_status,
        created_at,
        updated_at,
        thumbnail_path,
        duration_seconds,
        resolution,
        tags,
        project_id,
        qa_status,
        publish_status,
        projects(title)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    // Apply filters
    if (filterType !== 'all') {
      query = query.eq('file_type', filterType);
    }
    if (filterStatus !== 'all') {
      query = query.eq('upload_status', filterStatus);
    }
    if (searchQuery) {
      query = query.ilike('filename', `%${searchQuery}%`);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Failed to fetch assets:', error);
      return;
    }

    setAssets(data?.map(a => {
      // projects can be an object or array depending on the relationship
      const projectData = a.projects as { title: string } | { title: string }[] | null;
      const projectName = Array.isArray(projectData) 
        ? projectData[0]?.title 
        : projectData?.title;
      return {
        ...a,
        project_name: projectName,
        resolution: a.resolution as { width: number; height: number } | undefined,
      };
    }) || []);

    // Extract existing tags
    const allTags = new Set<string>();
    data?.forEach(a => a.tags?.forEach((t: string) => allTags.add(t)));
    setExistingTags(Array.from(allTags));
  }, [supabase, role, filterType, filterStatus, searchQuery]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Fetch processing jobs
  const fetchProcessingJobs = useCallback(async () => {
    if (!['admin', 'team'].includes(role || '')) return;
    
    const { data } = await supabase
      .from('processing_jobs')
      .select(`
        id,
        media_asset_id,
        type,
        status,
        progress,
        error_message,
        created_at,
        started_at,
        completed_at,
        metadata,
        media_assets(filename, mime_type)
      `)
      .in('status', ['pending', 'in_progress', 'failed'])
      .order('created_at', { ascending: false })
      .limit(50);

    setProcessingJobs(data?.map(j => {
      // media_assets can be an object or array depending on the relationship
      const assetData = j.media_assets as { filename: string; mime_type: string } | { filename: string; mime_type: string }[] | null;
      const filename = Array.isArray(assetData) ? assetData[0]?.filename : assetData?.filename;
      const mimeType = Array.isArray(assetData) ? assetData[0]?.mime_type : assetData?.mime_type;
      return {
        ...j,
        metadata: {
          ...(j.metadata as Record<string, unknown> || {}),
          filename,
          mime_type: mimeType,
        },
      };
    }) || []);
  }, [supabase, role]);

  useEffect(() => {
    fetchProcessingJobs();
  }, [fetchProcessingJobs]);

  // Handlers
  const handleUploadComplete = useCallback((files: { assetId: string; filename: string; r2Path: string }[]) => {
    console.log('Uploads complete:', files);
    fetchAssets();
    fetchProcessingJobs();
  }, [fetchAssets, fetchProcessingJobs]);

  const handleBulkAction = useCallback((action: string, ids: string[]) => {
    if (action === 'edit') {
      setShowMetadataEditor(true);
    } else if (action === 'publish' || action === 'vault') {
      setShowPublishModal(true);
    } else if (action === 'delete') {
      // TODO: Implement delete confirmation
      console.log('Delete:', ids);
    } else if (action === 'download') {
      // TODO: Implement batch download
      console.log('Download:', ids);
    }
  }, []);

  const handleBatchSave = useCallback(async (updates: BatchUpdate) => {
    // TODO: Implement batch update API call
    console.log('Batch update:', updates);
    await new Promise(resolve => setTimeout(resolve, 1000));
    fetchAssets();
  }, [fetchAssets]);

  const handlePublish = useCallback(async (config: PublishConfig) => {
    // TODO: Implement publish API call
    console.log('Publish:', config);
    await new Promise(resolve => setTimeout(resolve, 1000));
    fetchAssets();
  }, [fetchAssets]);

  const handleCreateCollection = useCallback(async (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('portfolio_collections')
      .insert({ name, slug })
      .select()
      .single();
    
    if (error) throw error;
    
    const newCollection = { ...data, item_count: 0 };
    setCollections(prev => [...prev, newCollection]);
    return newCollection;
  }, [supabase]);

  const handleRetryJob = useCallback(async (jobId: string) => {
    await supabase
      .from('processing_jobs')
      .update({ status: 'pending', error_message: null })
      .eq('id', jobId);
    fetchProcessingJobs();
  }, [supabase, fetchProcessingJobs]);

  const handleCancelJob = useCallback(async (jobId: string) => {
    await supabase
      .from('processing_jobs')
      .update({ status: 'cancelled' })
      .eq('id', jobId);
    fetchProcessingJobs();
  }, [supabase, fetchProcessingJobs]);

  // Get selected assets for modals
  const selectedAssets: SelectedAsset[] = assets
    .filter(a => selectedIds.has(a.id))
    .map(a => ({
      id: a.id,
      filename: a.filename,
      thumbnail_path: a.thumbnail_path,
      mime_type: a.mime_type,
    }));

  // Redirect if not authenticated or not admin/team
  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login?redirect=/admin/upload");
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!['admin', 'team'].includes(role || '')) {
    return (
      <div className="min-h-screen bg-linear-to-b from-[#0a0a1a] to-[#1a1a2e] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-white/60">You need admin or team permissions to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-[#0a0a1a] to-[#1a1a2e]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Media Hub</h1>
          <p className="mt-2 text-white/60">
            Upload, manage, and publish media assets
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-white/10">
          <nav className="flex space-x-8">
            {[
              { id: 'upload', label: 'Upload' },
              { id: 'library', label: 'Library' },
              { id: 'processing', label: 'Processing' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-4 px-1 font-medium text-sm border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-[#D4AF37] text-[#D4AF37]'
                    : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {tab.label}
                {tab.id === 'processing' && processingJobs.filter(j => j.status !== 'completed').length > 0 && (
                  <span className="ml-2 px-2 py-0.5 text-xs bg-blue-500 text-white rounded-full">
                    {processingJobs.filter(j => j.status !== 'completed').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Zone */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upload Options */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h2 className="text-lg font-semibold text-white mb-4">Upload Options</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* File Type */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">File Type</label>
                    <select
                      value={uploadFileType}
                      onChange={(e) => setUploadFileType(e.target.value as typeof uploadFileType)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="deliverable">Deliverable</option>
                      <option value="raw">Raw Footage</option>
                      <option value="portfolio">Portfolio</option>
                      <option value="team-wip">Work in Progress</option>
                    </select>
                  </div>

                  {/* Client */}
                  <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">Client (optional)</label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => {
                        setSelectedClientId(e.target.value);
                        setSelectedProjectId(''); // Reset project
                      }}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">No client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Project */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-white/70 mb-2">Project (optional)</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">No project</option>
                      {projects
                        .filter(p => !selectedClientId || p.client_id === selectedClientId)
                        .map(project => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                {/* Drag Drop Zone */}
                <DragDropZone
                  projectId={selectedProjectId || undefined}
                  clientId={selectedClientId || undefined}
                  fileType={uploadFileType}
                  onUploadComplete={handleUploadComplete}
                />
              </div>

              {/* Processing Jobs (inline) */}
              {processingJobs.length > 0 && (
                <ProcessingPanel
                  jobs={processingJobs}
                  onRetry={handleRetryJob}
                  onCancel={handleCancelJob}
                  onRefresh={fetchProcessingJobs}
                  collapsible
                  defaultExpanded={false}
                />
              )}
            </div>

            {/* Upload Guidelines */}
            <div className="lg:col-span-1">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 sticky top-8">
                <h3 className="text-lg font-semibold text-white mb-4">Upload Guidelines</h3>
                
                <div className="space-y-4 text-sm">
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-[#D4AF37]">Raw Files</h4>
                    <p className="text-white/60 mt-1">Original footage up to 5GB. Team-only access.</p>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-[#D4AF37]">Deliverables</h4>
                    <p className="text-white/60 mt-1">Final files for clients up to 1GB. Can be shared via vault.</p>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-[#D4AF37]">Portfolio</h4>
                    <p className="text-white/60 mt-1">Public showcase items up to 500MB.</p>
                  </div>
                  
                  <div className="p-3 bg-white/5 rounded-lg">
                    <h4 className="font-medium text-[#D4AF37]">Work in Progress</h4>
                    <p className="text-white/60 mt-1">Team collaboration files up to 2GB.</p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="font-medium text-white mb-3">Supported Formats</h4>
                  <div className="flex flex-wrap gap-2">
                    {['MP4', 'MOV', 'WEBM', 'JPG', 'PNG', 'WEBP', 'PDF', 'ZIP'].map(format => (
                      <span
                        key={format}
                        className="px-2 py-1 text-xs bg-white/10 text-white/70 rounded"
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

        {/* Library Tab */}
        {activeTab === 'library' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search files..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FileType)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Types</option>
                <option value="raw">Raw</option>
                <option value="deliverable">Deliverable</option>
                <option value="portfolio">Portfolio</option>
                <option value="team-wip">Work in Progress</option>
              </select>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as UploadStatus)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="complete">Complete</option>
                <option value="failed">Failed</option>
              </select>

              {/* View Toggle */}
              <div className="flex items-center bg-white/5 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-white/50'}`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/50'}`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
              </div>

              {/* Refresh */}
              <button
                onClick={fetchAssets}
                className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white transition"
              >
                <ArrowPathIcon className="w-5 h-5" />
              </button>
            </div>

            {/* File List */}
            <FileList
              assets={assets}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onPreview={(asset) => console.log('Preview:', asset)}
              onEdit={(asset) => {
                setSelectedIds(new Set([asset.id]));
                setShowMetadataEditor(true);
              }}
              onDelete={(asset) => console.log('Delete:', asset)}
              onDownload={(asset) => console.log('Download:', asset)}
              onBulkAction={handleBulkAction}
              emptyMessage="No files match your filters"
            />
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'processing' && (
          <ProcessingPanel
            jobs={processingJobs}
            onRetry={handleRetryJob}
            onCancel={handleCancelJob}
            onRefresh={fetchProcessingJobs}
            collapsible={false}
            defaultExpanded
          />
        )}
      </div>

      {/* Modals */}
      <BatchMetadataEditor
        isOpen={showMetadataEditor}
        onClose={() => setShowMetadataEditor(false)}
        selectedIds={Array.from(selectedIds)}
        onSave={handleBatchSave}
        clients={clients}
        projects={projects}
        vaults={vaults}
        existingTags={existingTags}
      />

      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        selectedAssets={selectedAssets}
        collections={collections}
        vaults={vaults}
        presets={presets}
        onPublish={handlePublish}
        onCreateCollection={handleCreateCollection}
      />
    </div>
  );
}
