"use client";

import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  PhotoIcon,
  FolderIcon,
  GlobeAltIcon,
  CalendarIcon,
  LockClosedIcon,
  ClockIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/**
 * PublishModal
 * 
 * Modal for publishing files to:
 * - Portfolio (public website)
 * - Client Vault (secure delivery)
 * 
 * Features:
 * - Collection selection/creation
 * - Scheduled publishing
 * - Expiry dates for vault items
 * - Preview before publish
 */

interface PortfolioCollection {
  id: string;
  name: string;
  slug: string;
  item_count: number;
}

interface ClientVault {
  id: string;
  name: string;
  client_id: string;
  client_name: string;
  expires_at?: string;
}

interface PublishPreset {
  id: string;
  name: string;
  target_type: 'portfolio' | 'vault';
  settings: {
    collection_id?: string;
    vault_id?: string;
    default_visibility?: 'public' | 'unlisted' | 'private';
    auto_expire_days?: number;
    watermark?: boolean;
    notify_client?: boolean;
  };
}

interface SelectedAsset {
  id: string;
  filename: string;
  thumbnail_path?: string;
  mime_type: string;
}

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: SelectedAsset[];
  collections: PortfolioCollection[];
  vaults: ClientVault[];
  presets: PublishPreset[];
  onPublish: (config: PublishConfig) => Promise<void>;
  onCreateCollection?: (name: string) => Promise<PortfolioCollection>;
}

interface PublishConfig {
  assetIds: string[];
  target: 'portfolio' | 'vault';
  portfolioConfig?: {
    collectionId: string;
    visibility: 'public' | 'unlisted' | 'private';
    scheduledAt?: string;
    featured?: boolean;
    sortOrder?: number;
  };
  vaultConfig?: {
    vaultId: string;
    expiresAt?: string;
    notifyClient: boolean;
    message?: string;
  };
  presetId?: string;
}

export default function PublishModal({
  isOpen,
  onClose,
  selectedAssets,
  collections,
  vaults,
  presets,
  onPublish,
  onCreateCollection,
}: PublishModalProps) {
  // State
  const [isPublishing, setIsPublishing] = useState(false);
  const [target, setTarget] = useState<'portfolio' | 'vault'>('portfolio');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  
  // Portfolio options
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreatingCollection, setIsCreatingCollection] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [scheduledAt, setScheduledAt] = useState<string>('');
  const [featured, setFeatured] = useState(false);
  
  // Vault options
  const [selectedVault, setSelectedVault] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [notifyClient, setNotifyClient] = useState(true);
  const [clientMessage, setClientMessage] = useState('');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setTarget('portfolio');
      setSelectedPreset(null);
      setSelectedCollection('');
      setNewCollectionName('');
      setVisibility('public');
      setScheduledAt('');
      setFeatured(false);
      setSelectedVault('');
      setExpiresAt('');
      setNotifyClient(true);
      setClientMessage('');
    }
  }, [isOpen]);

  // Apply preset
  useEffect(() => {
    if (selectedPreset) {
      const preset = presets.find(p => p.id === selectedPreset);
      if (preset) {
        setTarget(preset.target_type);
        if (preset.settings.collection_id) {
          setSelectedCollection(preset.settings.collection_id);
        }
        if (preset.settings.vault_id) {
          setSelectedVault(preset.settings.vault_id);
        }
        if (preset.settings.default_visibility) {
          setVisibility(preset.settings.default_visibility);
        }
        if (preset.settings.notify_client !== undefined) {
          setNotifyClient(preset.settings.notify_client);
        }
        if (preset.settings.auto_expire_days) {
          const expiry = new Date();
          expiry.setDate(expiry.getDate() + preset.settings.auto_expire_days);
          setExpiresAt(expiry.toISOString().slice(0, 16));
        }
      }
    }
  }, [selectedPreset, presets]);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim() || !onCreateCollection) return;
    setIsCreatingCollection(true);
    try {
      const newCollection = await onCreateCollection(newCollectionName.trim());
      setSelectedCollection(newCollection.id);
      setNewCollectionName('');
    } catch (error) {
      console.error('Failed to create collection:', error);
    } finally {
      setIsCreatingCollection(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      const config: PublishConfig = {
        assetIds: selectedAssets.map(a => a.id),
        target,
        presetId: selectedPreset || undefined,
      };

      if (target === 'portfolio') {
        config.portfolioConfig = {
          collectionId: selectedCollection,
          visibility,
          scheduledAt: scheduledAt || undefined,
          featured,
        };
      } else {
        config.vaultConfig = {
          vaultId: selectedVault,
          expiresAt: expiresAt || undefined,
          notifyClient,
          message: clientMessage || undefined,
        };
      }

      await onPublish(config);
      onClose();
    } catch (error) {
      console.error('Failed to publish:', error);
    } finally {
      setIsPublishing(false);
    }
  };

  const canPublish = target === 'portfolio' 
    ? !!selectedCollection 
    : !!selectedVault;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e] border border-white/10 rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/10 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Publish Files</h2>
            <p className="text-sm text-white/60 mt-1">
              {selectedAssets.length} file{selectedAssets.length !== 1 ? 's' : ''} selected
            </p>
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
          {/* File Preview Strip */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {selectedAssets.slice(0, 8).map(asset => (
              <div
                key={asset.id}
                className="shrink-0 w-16 h-16 rounded-lg bg-white/10 overflow-hidden"
              >
                {asset.thumbnail_path ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${asset.thumbnail_path}`}
                    alt={asset.filename}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center text-white/30 ${asset.thumbnail_path ? 'hidden' : ''}`}>
                  <PhotoIcon className="w-6 h-6" />
                </div>
              </div>
            ))}
            {selectedAssets.length > 8 && (
              <div className="shrink-0 w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center text-white/60 text-sm">
                +{selectedAssets.length - 8}
              </div>
            )}
          </div>

          {/* Presets */}
          {presets.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Quick Preset</label>
              <div className="flex flex-wrap gap-2">
                {presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => setSelectedPreset(selectedPreset === preset.id ? null : preset.id)}
                    className={`
                      px-4 py-2 rounded-lg text-sm font-medium transition
                      ${selectedPreset === preset.id
                        ? 'bg-[#D4AF37] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }
                    `}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Target Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-white">Publish To</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setTarget('portfolio')}
                className={`
                  p-4 rounded-xl border-2 transition text-left
                  ${target === 'portfolio'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <GlobeAltIcon className={`w-8 h-8 mb-2 ${target === 'portfolio' ? 'text-[#D4AF37]' : 'text-white/60'}`} />
                <h3 className="font-semibold text-white">Portfolio</h3>
                <p className="text-sm text-white/60 mt-1">Publish to public website showcase</p>
              </button>
              <button
                onClick={() => setTarget('vault')}
                className={`
                  p-4 rounded-xl border-2 transition text-left
                  ${target === 'vault'
                    ? 'border-[#D4AF37] bg-[#D4AF37]/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }
                `}
              >
                <LockClosedIcon className={`w-8 h-8 mb-2 ${target === 'vault' ? 'text-[#D4AF37]' : 'text-white/60'}`} />
                <h3 className="font-semibold text-white">Client Vault</h3>
                <p className="text-sm text-white/60 mt-1">Secure delivery to specific client</p>
              </button>
            </div>
          </div>

          {/* Portfolio Options */}
          {target === 'portfolio' && (
            <div className="space-y-4 p-4 bg-white/5 rounded-xl">
              {/* Collection Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <FolderIcon className="w-4 h-4 text-[#D4AF37]" />
                  Collection
                </label>
                <select
                  value={selectedCollection}
                  onChange={(e) => setSelectedCollection(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">Select a collection...</option>
                  {collections.map(collection => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name} ({collection.item_count} items)
                    </option>
                  ))}
                </select>
                
                {/* Create new collection */}
                {onCreateCollection && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={newCollectionName}
                      onChange={(e) => setNewCollectionName(e.target.value)}
                      placeholder="Or create new collection..."
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
                    />
                    <button
                      onClick={handleCreateCollection}
                      disabled={!newCollectionName.trim() || isCreatingCollection}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg disabled:opacity-50 transition"
                    >
                      {isCreatingCollection ? 'Creating...' : 'Create'}
                    </button>
                  </div>
                )}
              </div>

              {/* Visibility */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <GlobeAltIcon className="w-4 h-4 text-[#D4AF37]" />
                  Visibility
                </label>
                <div className="flex gap-2">
                  {(['public', 'unlisted', 'private'] as const).map(v => (
                    <button
                      key={v}
                      onClick={() => setVisibility(v)}
                      className={`
                        flex-1 py-2 px-4 rounded-lg border transition capitalize
                        ${visibility === v
                          ? 'border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37]'
                          : 'border-white/10 text-white/60 hover:bg-white/10'
                        }
                      `}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <CalendarIcon className="w-4 h-4 text-[#D4AF37]" />
                  Schedule (optional)
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-xs text-white/50">Leave empty to publish immediately</p>
              </div>

              {/* Featured */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`
                  w-5 h-5 rounded border flex items-center justify-center transition
                  ${featured ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/30'}
                `}>
                  {featured && <CheckIcon className="w-3 h-3 text-black" />}
                </div>
                <span className="text-white">Mark as featured work</span>
              </label>
            </div>
          )}

          {/* Vault Options */}
          {target === 'vault' && (
            <div className="space-y-4 p-4 bg-white/5 rounded-xl">
              {/* Vault Selection */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <FolderIcon className="w-4 h-4 text-[#D4AF37]" />
                  Client Vault
                </label>
                <select
                  value={selectedVault}
                  onChange={(e) => setSelectedVault(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                >
                  <option value="">Select a vault...</option>
                  {vaults.map(vault => (
                    <option key={vault.id} value={vault.id}>
                      {vault.client_name} - {vault.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expiry */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-white">
                  <ClockIcon className="w-4 h-4 text-[#D4AF37]" />
                  Access Expires (optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-xs text-white/50">Leave empty for no expiration</p>
              </div>

              {/* Notify Client */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className={`
                  w-5 h-5 rounded border flex items-center justify-center transition
                  ${notifyClient ? 'bg-[#D4AF37] border-[#D4AF37]' : 'border-white/30'}
                `}
                onClick={() => setNotifyClient(!notifyClient)}
                >
                  {notifyClient && <CheckIcon className="w-3 h-3 text-black" />}
                </div>
                <span className="text-white">Send email notification to client</span>
              </label>

              {/* Message */}
              {notifyClient && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Message (optional)</label>
                  <textarea
                    value={clientMessage}
                    onChange={(e) => setClientMessage(e.target.value)}
                    placeholder="Add a personal message for the client..."
                    rows={3}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37] resize-none"
                  />
                </div>
              )}

              {/* Warning for vault without expiry */}
              {selectedVault && !expiresAt && (
                <div className="flex items-start gap-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">No expiration set</p>
                    <p className="text-xs text-yellow-400/70">Client will have permanent access to these files</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-[#1a1a2e] border-t border-white/10 p-6 flex items-center justify-between">
          <div className="text-sm text-white/50">
            {target === 'portfolio' && visibility === 'public' && !scheduledAt && (
              <span>Will be visible on your website immediately</span>
            )}
            {target === 'portfolio' && scheduledAt && (
              <span>Scheduled for {new Date(scheduledAt).toLocaleString()}</span>
            )}
            {target === 'vault' && notifyClient && (
              <span>Client will receive email notification</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-white/70 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!canPublish || isPublishing}
              className="px-6 py-2.5 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#D4AF37]/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Publishing...
                </>
              ) : (
                <>
                  {target === 'portfolio' ? 'Publish to Portfolio' : 'Send to Client'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { PublishConfig, SelectedAsset };
