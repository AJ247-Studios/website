"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";

export interface CreateProjectModalProps {
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

interface ClientOption {
  id: string;
  email: string;
  display_name?: string;
}

/**
 * Create Project Modal
 * 
 * Admin/Team only — creates a new project with:
 * - Title & description
 * - Client selection (existing user or invite)
 * - Optional team members
 */
export function CreateProjectModal({ onClose, onCreated }: CreateProjectModalProps) {
  const { supabase, session, user } = useSupabase();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<ClientOption | null>(null);
  const [shootDate, setShootDate] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  
  // Search state
  const [searchResults, setSearchResults] = useState<ClientOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Submit state
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search for clients
  const searchClients = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("id, email, display_name")
        .or(`email.ilike.%${query}%,display_name.ilike.%${query}%`)
        .limit(10);

      setSearchResults(data || []);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  }, [supabase]);

  // Handle search input
  const handleSearchChange = (value: string) => {
    setClientSearch(value);
    setSelectedClient(null);
    searchClients(value);
  };

  // Select a client
  const handleSelectClient = (client: ClientOption) => {
    setSelectedClient(client);
    setClientSearch(client.display_name || client.email);
    setSearchResults([]);
  };

  // Create project
  const handleCreate = useCallback(async () => {
    if (!session || !user) return;
    if (!title.trim()) {
      setError("Project title is required");
      return;
    }
    if (!selectedClient) {
      setError("Please select a client");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const token = session.access_token;

      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          client_id: selectedClient.id,
          shoot_date: shootDate || null,
          delivery_date: deliveryDate || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create project");
      }

      const { project } = await res.json();
      onCreated(project.id);

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  }, [session, user, title, description, selectedClient, shootDate, deliveryDate, onCreated]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Project</h2>
            <p className="text-sm text-zinc-400 mt-1">Set up a new client project</p>
          </div>
          <button
            onClick={onClose}
            disabled={isCreating}
            className="p-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Project Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Wedding Photography – Smith & Jones"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief project description..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Client Search */}
          <div className="relative">
            <label className="block text-sm font-medium text-zinc-400 mb-2">
              Client <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientSearch}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search by email or name..."
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && !selectedClient && (
              <div className="absolute z-10 w-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client)}
                    className="w-full px-3 py-2 text-left hover:bg-zinc-700 transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    <p className="text-sm text-white">{client.display_name || "No name"}</p>
                    <p className="text-xs text-zinc-400">{client.email}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Selected client indicator */}
            {selectedClient && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-emerald-400">
                  {selectedClient.display_name || selectedClient.email}
                </span>
                <button
                  onClick={() => {
                    setSelectedClient(null);
                    setClientSearch("");
                  }}
                  className="ml-auto text-zinc-400 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Shoot Date
              </label>
              <input
                type="date"
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !title.trim() || !selectedClient}
            className="px-6 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              "Create Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateProjectModal;
