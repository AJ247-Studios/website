"use client";

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    setUploading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("youtube_id", youtubeId);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setMessage("Upload successful!");
        setFile(null);
        setTitle("");
        setDescription("");
        setYoutubeId("");
        // Reset file input
        const fileInput = document.getElementById(
          "file-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setMessage("Upload failed. Please try again.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
      <div>
        <label
          htmlFor="file-upload"
          className="block text-sm font-medium mb-2"
        >
          File
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          accept="image/*,video/*"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          required
        />
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium mb-2"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
        />
      </div>

      <div>
        <label htmlFor="youtube-id" className="block text-sm font-medium mb-2">
          YouTube Video ID (optional)
        </label>
        <input
          id="youtube-id"
          type="text"
          value={youtubeId}
          onChange={(e) => setYoutubeId(e.target.value)}
          placeholder="e.g., dQw4w9WgXcQ"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
        />
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50 transition-colors"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {message && (
        <div
          className={`text-center ${
            message.includes("successful")
              ? "text-green-600"
              : "text-red-600"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
