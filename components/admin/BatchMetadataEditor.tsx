"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  TagIcon,
  UserGroupIcon,
  FolderIcon,
  CalendarIcon,
  CheckIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

/**
 * BatchMetadataEditor
 * 
 * Modal for bulk editing metadata on selected files:
 * - Add/remove tags
 * - Assign to client
 * - Assign to project
 * - Set QA status
 * - Add to vault
 */

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
}

interface BatchMetadataEditorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSave: (updates: BatchUpdate) => Promise<void>;
  clients: Client[];
  projects: Project[];
  vaults: Vault[];
  existingTags?: string[];
}

interface BatchUpdate {
  assetIds: string[];
  tagsToAdd?: string[];
  tagsToRemove?: string[];
  clientId?: string | null;
  projectId?: string | null;
  vaultId?: string | null;
  qaStatus?: 'pending' | 'approved' | 'rejected';
}

const PRESET_TAGS = [
  'final', 'draft', 'raw', 'b-roll', 'interview', // 'drone', 
  'highlight', 'full-length', 'social', 'web', 'print',
  'needs-review', 'approved', 'archive',
];

export default function BatchMetadataEditor({
  isOpen,
  onClose,
  selectedIds,
  onSave,
  clients,
  projects,
  vaults,
  existingTags = [],
}: BatchMetadataEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [tagsToAdd, setTagsToAdd] = useState<string[]>([]);
  const [tagsToRemove, setTagsToRemove] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedVault, setSelectedVault] = useState<string | null>(null);
  const [qaStatus, setQaStatus] = useState<'pending' | 'approved' | 'rejected' | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTagsToAdd([]);
      setTagsToRemove([]);
      setNewTag('');
      setSelectedClient(null);
      setSelectedProject(null);
      setSelectedVault(null);
      setQaStatus(null);
    }
  }, [isOpen]);

  // Filter projects by selected client
  const filteredProjects = selectedClient
    ? projects.filter(p => p.client_id === selectedClient)
    : projects;

  // Filter vaults by selected client
  const filteredVaults = selectedClient
    ? vaults.filter(v => v.client_id === selectedClient)
    : vaults;

  // Available tags (preset + existing, minus already selected)
  const availableTags = [...new Set([...PRESET_TAGS, ...existingTags])]
    .filter(t => !tagsToAdd.includes(t));

  const handleAddTag = (tag: string) => {
    if (tag && !tagsToAdd.includes(tag)) {
      setTagsToAdd([...tagsToAdd, tag]);
      // If it was in remove list, take it out
      setTagsToRemove(tagsToRemove.filter(t => t !== tag));
    }
  };

  const handleRemoveTagFromAdd = (tag: string) => {
    setTagsToAdd(tagsToAdd.filter(t => t !== tag));
  };

  const handleMarkTagForRemoval = (tag: string) => {
    if (!tagsToRemove.includes(tag)) {
      setTagsToRemove([...tagsToRemove, tag]);
      // Remove from add list if present
      setTagsToAdd(tagsToAdd.filter(t => t !== tag));
    }
  };

  const handleAddNewTag = () => {
    const normalized = newTag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalized) {
      handleAddTag(normalized);
      setNewTag('');
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: BatchUpdate = {
        assetIds: selectedIds,
      };

      if (tagsToAdd.length > 0) updates.tagsToAdd = tagsToAdd;
      if (tagsToRemove.length > 0) updates.tagsToRemove = tagsToRemove;
      if (selectedClient !== null) updates.clientId = selectedClient;
      if (selectedProject !== null) updates.projectId = selectedProject;
      if (selectedVault !== null) updates.vaultId = selectedVault;
      if (qaStatus !== null) updates.qaStatus = qaStatus;

      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Failed to save batch updates:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = tagsToAdd.length > 0 || tagsToRemove.length > 0 || 
    selectedClient !== null || selectedProject !== null || 
    selectedVault !== null || qaStatus !== null;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Edit {selectedIds.length} Files</h2>
            <p className="text-sm text-white/60 mt-1">Changes will apply to all selected files</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Tags Section */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <TagIcon className="w-4 h-4 text-[#D4AF37]" />
              Tags
            </label>
            
            {/* Tags to add */}
            {tagsToAdd.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagsToAdd.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm"
                  >
                    <PlusIcon className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => handleRemoveTagFromAdd(tag)}
                      className="ml-1 hover:text-white"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tags to remove (from existing) */}
            {tagsToRemove.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tagsToRemove.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm line-through"
                  >
                    {tag}
                    <button
                      onClick={() => setTagsToRemove(tagsToRemove.filter(t => t !== tag))}
                      className="ml-1 hover:text-white"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add new tag */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNewTag()}
                placeholder="Add custom tag..."
                className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
              <button
                onClick={handleAddNewTag}
                disabled={!newTag.trim()}
                className="px-4 py-2 bg-[#D4AF37] text-black font-medium rounded-lg hover:bg-[#D4AF37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Add
              </button>
            </div>

            {/* Preset tags */}
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 12).map(tag => (
                <button
                  key={tag}
                  onClick={() => handleAddTag(tag)}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-full text-sm transition"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Existing tags to remove */}
            {existingTags.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <p className="text-xs text-white/50 mb-2">Click to remove from selected files:</p>
                <div className="flex flex-wrap gap-2">
                  {existingTags.filter(t => !tagsToRemove.includes(t)).map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleMarkTagForRemoval(tag)}
                      className="px-3 py-1 bg-white/10 hover:bg-red-500/20 text-white/60 hover:text-red-400 rounded-full text-sm transition"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Client Assignment */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <UserGroupIcon className="w-4 h-4 text-[#D4AF37]" />
              Assign to Client
            </label>
            <select
              value={selectedClient || ''}
              onChange={(e) => {
                setSelectedClient(e.target.value || null);
                setSelectedProject(null); // Reset project when client changes
                setSelectedVault(null); // Reset vault when client changes
              }}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">— No change —</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>

          {/* Project Assignment */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <FolderIcon className="w-4 h-4 text-[#D4AF37]" />
              Assign to Project
            </label>
            <select
              value={selectedProject || ''}
              onChange={(e) => setSelectedProject(e.target.value || null)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">— No change —</option>
              {filteredProjects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>

          {/* Vault Assignment */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <FolderIcon className="w-4 h-4 text-[#D4AF37]" />
              Add to Client Vault
            </label>
            <select
              value={selectedVault || ''}
              onChange={(e) => setSelectedVault(e.target.value || null)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="">— No change —</option>
              {filteredVaults.map(vault => (
                <option key={vault.id} value={vault.id}>{vault.name}</option>
              ))}
            </select>
            {selectedVault && (
              <p className="text-xs text-white/50">
                Files will be added to the client vault for secure delivery
              </p>
            )}
          </div>

          {/* QA Status */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-white">
              <CheckIcon className="w-4 h-4 text-[#D4AF37]" />
              QA Status
            </label>
            <div className="flex gap-3">
              {(['pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setQaStatus(qaStatus === status ? null : status)}
                  className={`
                    flex-1 py-3 px-4 rounded-lg border transition font-medium capitalize
                    ${qaStatus === status 
                      ? status === 'approved' 
                        ? 'bg-green-500/20 border-green-500 text-green-400'
                        : status === 'rejected'
                          ? 'bg-red-500/20 border-red-500 text-red-400'
                          : 'bg-gray-500/20 border-gray-500 text-gray-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                    }
                  `}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a2e] border-t border-white/10 p-6 flex items-center justify-between">
          <p className="text-sm text-white/50">
            {hasChanges ? 'Changes pending' : 'No changes'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-white/70 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#D4AF37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>Apply to {selectedIds.length} Files</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { BatchUpdate };
