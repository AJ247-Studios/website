/**
 * ShareLinkModal Component
 * 
 * Create expiring share links:
 * - Set expiration time
 * - Permission controls (view, download)
 * - Password protection option
 * - Copy link to clipboard
 */

"use client";

import { useState } from "react";

interface ShareLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLink: (options: ShareLinkOptions) => Promise<{ url: string }>;
  itemTitle?: string;
}

export interface ShareLinkOptions {
  expiresIn: "1h" | "24h" | "7d" | "30d" | "never";
  permissions: "view" | "download";
  password?: string;
  resolution?: "original" | "high" | "medium" | "low";
}

export function ShareLinkModal({
  isOpen,
  onClose,
  onCreateLink,
  itemTitle,
}: ShareLinkModalProps) {
  const [creating, setCreating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<ShareLinkOptions>({
    expiresIn: "7d",
    permissions: "view",
  });
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleCreate = async () => {
    setCreating(true);
    try {
      const result = await onCreateLink({
        ...options,
        password: usePassword ? password : undefined,
      });
      setGeneratedUrl(result.url);
      // Analytics: track share link created
      // analytics.track("share_link_created", { expires_at: options.expiresIn, permission: options.permissions });
    } catch (error) {
      console.error("Failed to create share link:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedUrl(null);
    setCopied(false);
    setOptions({ expiresIn: "7d", permissions: "view" });
    setUsePassword(false);
    setPassword("");
    onClose();
  };

  const expiryOptions = [
    { value: "1h", label: "1 hour" },
    { value: "24h", label: "24 hours" },
    { value: "7d", label: "7 days" },
    { value: "30d", label: "30 days" },
    { value: "never", label: "Never expires" },
  ];

  const resolutionOptions = [
    { value: "original", label: "Original quality" },
    { value: "high", label: "High (1080p)" },
    { value: "medium", label: "Medium (720p)" },
    { value: "low", label: "Low (480p)" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {generatedUrl ? "Share Link Created" : "Create Share Link"}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {generatedUrl ? (
          /* Success state - show generated link */
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            {itemTitle && (
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Share link for "{itemTitle}"
              </p>
            )}

            {/* Link display */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={generatedUrl}
                readOnly
                className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white"
              />
              <button
                onClick={handleCopy}
                className={`shrink-0 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  copied
                    ? "bg-emerald-600 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Link details */}
            <div className="flex items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Expires in {expiryOptions.find(o => o.value === options.expiresIn)?.label}
              </span>
              <span className="flex items-center gap-1">
                {options.permissions === "download" ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Can download
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View only
                  </>
                )}
              </span>
              {usePassword && (
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Password protected
                </span>
              )}
            </div>

            <button
              onClick={handleClose}
              className="w-full py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Done
            </button>
          </div>
        ) : (
          /* Form state - configure options */
          <div className="p-4 space-y-4">
            {itemTitle && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create a shareable link for "{itemTitle}"
              </p>
            )}

            {/* Expiration */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Link expires in
              </label>
              <div className="grid grid-cols-3 gap-2">
                {expiryOptions.slice(0, 3).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setOptions({ ...options, expiresIn: option.value as ShareLinkOptions["expiresIn"] })
                    }
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      options.expiresIn === option.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {expiryOptions.slice(3).map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setOptions({ ...options, expiresIn: option.value as ShareLinkOptions["expiresIn"] })
                    }
                    className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                      options.expiresIn === option.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Permissions
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, permissions: "view" })}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                    options.permissions === "view"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View only
                </button>
                <button
                  type="button"
                  onClick={() => setOptions({ ...options, permissions: "download" })}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                    options.permissions === "download"
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Can download
                </button>
              </div>
            </div>

            {/* Download resolution (only if download is enabled) */}
            {options.permissions === "download" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Download resolution
                </label>
                <select
                  value={options.resolution || "original"}
                  onChange={(e) =>
                    setOptions({
                      ...options,
                      resolution: e.target.value as ShareLinkOptions["resolution"],
                    })
                  }
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  {resolutionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Password protection */}
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={usePassword}
                  onChange={(e) => setUsePassword(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Password protect this link
                </span>
              </label>
              {usePassword && (
                <input
                  type="text"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a password"
                  className="mt-2 w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              )}
            </div>

            {/* Create button */}
            <button
              onClick={handleCreate}
              disabled={creating || (usePassword && !password)}
              className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {creating ? "Creating..." : "Create Share Link"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareLinkModal;
