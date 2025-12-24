/**
 * Admin Media Management Page
 * 
 * Complete visual editor for site hero images and portfolio tiles.
 * Features:
 * - Visual WYSIWYG canvas with device preview
 * - Click-to-edit image hotspots
 * - Media library with search/filter
 * - Focal point picker for responsive crops
 * - Drag & drop uploads
 */

"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VisualPageEditor from "@/components/admin/VisualPageEditor";
import MediaLibrary from "@/components/admin/MediaLibrary";
import ImageEditorPanel from "@/components/admin/ImageEditorPanel";
import { uploadSiteImage, SiteImage } from "@/lib/site-media";

type ActiveTab = "visual-editor" | "media-library" | "upload";

export default function AdminMediaPage() {
  const { session, role } = useSupabase();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("visual-editor");
  const [loading, setLoading] = useState(true);
  
  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<SiteImage | null>(null);

  // Auth check
  useEffect(() => {
    if (session === null) {
      router.push("/login");
      return;
    }
    if (session && role !== "admin") {
      router.push("/");
      return;
    }
    if (session && role === "admin") {
      setLoading(false);
    }
  }, [session, role, router]);

  // Handle file upload
  const handleUpload = async () => {
    if (!uploadFile) return;
    
    setUploading(true);
    setUploadError(null);
    setUploadSuccess(null);
    
    try {
      const result = await uploadSiteImage(uploadFile, {
        category: "general",
      });
      setUploadSuccess(result.image);
      setUploadFile(null);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back to admin */}
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back to Admin</span>
              </Link>
              <div className="h-6 w-px bg-slate-700" />
              <h1 className="text-lg font-semibold text-white">Media Manager</h1>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab("upload")}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Upload
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab navigation */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-8">
            {[
              { key: "visual-editor", label: "Visual Editor", icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              )},
              { key: "media-library", label: "Media Library", icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )},
              { key: "upload", label: "Upload", icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )},
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as ActiveTab)}
                className={`
                  flex items-center gap-2 py-4 border-b-2 font-medium transition-colors
                  ${activeTab === tab.key
                    ? "border-blue-500 text-blue-500"
                    : "border-transparent text-slate-400 hover:text-white"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Visual Editor Tab */}
        {activeTab === "visual-editor" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Visual Page Editor</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Click on any image to edit. Toggle device preview to see responsive behavior.
                </p>
              </div>
            </div>
            <VisualPageEditor />
          </div>
        )}

        {/* Media Library Tab */}
        {activeTab === "media-library" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Media Library</h2>
                <p className="text-slate-400 text-sm mt-1">
                  Browse, search, and manage all uploaded images.
                </p>
              </div>
            </div>
            <MediaLibrary />
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === "upload" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-white">Upload New Image</h2>
              <p className="text-slate-400 text-sm mt-1">
                Upload images to use in hero sections and portfolio tiles.
              </p>
            </div>

            {/* Success message */}
            {uploadSuccess && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-green-400 font-medium">Image uploaded successfully!</p>
                    <p className="text-green-400/70 text-sm mt-1">
                      {uploadSuccess.filename} • {uploadSuccess.width}×{uploadSuccess.height}px
                    </p>
                  </div>
                  <img 
                    src={uploadSuccess.public_url || ""} 
                    alt="" 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <button
                    onClick={() => { setUploadSuccess(null); setActiveTab("visual-editor"); }}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium"
                  >
                    Assign to page element
                  </button>
                  <button
                    onClick={() => setUploadSuccess(null)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                  >
                    Upload another
                  </button>
                </div>
              </div>
            )}

            {/* Error message */}
            {uploadError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <div className="flex items-center gap-3">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-red-400 font-medium">Upload failed</p>
                    <p className="text-red-400/70 text-sm mt-1">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Upload area */}
            {!uploadSuccess && (
              <div
                className={`
                  relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
                  transition-colors duration-200
                  ${uploadFile
                    ? "border-blue-500 bg-blue-500/5"
                    : "border-slate-700 hover:border-slate-600 hover:bg-slate-800/50"
                  }
                `}
                onClick={() => document.getElementById("file-input")?.click()}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = e.dataTransfer.files;
                  if (files.length > 0) setUploadFile(files[0]);
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && setUploadFile(e.target.files[0])}
                />
                
                {uploadFile ? (
                  <div className="space-y-4">
                    <img
                      src={URL.createObjectURL(uploadFile)}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <div>
                      <p className="text-white font-medium">{uploadFile.name}</p>
                      <p className="text-slate-400 text-sm">
                        {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); setUploadFile(null); }}
                        className="px-4 py-2 text-slate-400 hover:text-white text-sm"
                      >
                        Choose different
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleUpload(); }}
                        disabled={uploading}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
                      >
                        {uploading ? (
                          <span className="flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Uploading...
                          </span>
                        ) : (
                          "Upload Image"
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-slate-800 flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Drag & drop an image here</p>
                      <p className="text-slate-400 text-sm mt-1">or click to browse files</p>
                    </div>
                    <p className="text-slate-500 text-xs">
                      JPEG, PNG, WebP, AVIF, GIF • Max 10MB • Recommended: 1920×1080 or larger
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            <div className="bg-slate-800/50 rounded-xl p-6 space-y-4">
              <h3 className="text-white font-medium flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Image Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong className="text-slate-300">Hero images:</strong> Minimum 1920×1080px for sharp display on desktop</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong className="text-slate-300">Portfolio tiles:</strong> 1200×800px or higher with 3:2 or 4:3 aspect ratio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong className="text-slate-300">File format:</strong> WebP or AVIF for best compression; JPEG for photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400">•</span>
                  <span><strong className="text-slate-300">Focal point:</strong> Set after upload to control how images crop at different sizes</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
