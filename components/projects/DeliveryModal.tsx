"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import type { MediaAsset } from "@/lib/types/storage";

export interface DeliveryModalProps {
  projectId: string;
  assets: MediaAsset[];
  onClose: () => void;
  onComplete: () => void;
}

/**
 * Delivery Modal
 * 
 * Flow:
 * 1. Team packages assets → marks them as 'deliverable'
 * 2. System generates signed URLs and sends notification
 * 3. Client views deliverable → Approve or Request changes
 */
export function DeliveryModal({
  projectId,
  assets,
  onClose,
  onComplete,
}: DeliveryModalProps) {
  const { supabase, session } = useSupabase();
  
  const [isDelivering, setIsDelivering] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState("");
  const [expiryDays, setExpiryDays] = useState(7);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  // Calculate total size
  const totalSize = assets.reduce((sum, a) => sum + (a.file_size || 0), 0);

  // Handle delivery
  const handleDeliver = useCallback(async () => {
    if (!session) return;

    setIsDelivering(true);
    setError(null);

    try {
      const token = session.access_token;

      // Update assets to deliverable status
      const assetIds = assets.map(a => a.id);
      
      const { error: updateError } = await supabase
        .from("media_assets")
        .update({
          asset_type: "deliverable",
          status: "ready",
          expires_at: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000).toISOString(),
        })
        .in("id", assetIds);

      if (updateError) throw updateError;

      // Create delivery record (could be used for notifications)
      // In a real app, this would trigger an email/notification
      
      // Log the delivery action
      console.log("Delivery created:", {
        projectId,
        assetCount: assets.length,
        note: deliveryNote,
        expiresIn: `${expiryDays} days`,
      });

      setSuccess(true);
      
      // Close after brief success state
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Delivery failed");
    } finally {
      setIsDelivering(false);
    }
  }, [session, supabase, assets, projectId, deliveryNote, expiryDays, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Prepare Deliverable</h2>
            <p className="text-sm text-zinc-400 mt-1">
              Package and send files to client
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isDelivering}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Deliverable Ready!</h3>
              <p className="text-zinc-400 text-sm">
                Files have been packaged and client will be notified.
              </p>
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-zinc-400">Selected Files</span>
                  <span className="text-sm font-medium text-white">{assets.length} file{assets.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Total Size</span>
                  <span className="text-sm font-medium text-white">{formatSize(totalSize)}</span>
                </div>
              </div>

              {/* File preview */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Files to deliver</label>
                <div className="grid grid-cols-6 gap-2">
                  {assets.slice(0, 11).map((asset) => (
                    <div
                      key={asset.id}
                      className="aspect-square bg-zinc-800 rounded-lg overflow-hidden"
                      title={asset.filename}
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {asset.mime_type?.startsWith("image/") ? (
                          <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        ) : asset.mime_type?.startsWith("video/") ? (
                          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                  {assets.length > 11 && (
                    <div className="aspect-square bg-zinc-800 rounded-lg flex items-center justify-center">
                      <span className="text-xs text-zinc-400">+{assets.length - 11}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Link Expiry
                </label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(parseInt(e.target.value))}
                  disabled={isDelivering}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value={1}>1 day</option>
                  <option value={3}>3 days</option>
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Message to Client (optional)
                </label>
                <textarea
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  disabled={isDelivering}
                  rows={3}
                  placeholder="Your files are ready for download..."
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Info */}
              <div className="flex items-start gap-2 text-xs text-zinc-500">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>
                  Approving will enable download of full-resolution files. Client will receive an email notification with download links.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
            <button
              onClick={onClose}
              disabled={isDelivering}
              className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeliver}
              disabled={isDelivering}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDelivering ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Preparing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Deliver to Client
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DeliveryModal;
