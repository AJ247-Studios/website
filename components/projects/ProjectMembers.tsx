"use client";

import { useState, useCallback } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import type { ProjectMember } from "./ProjectPage";

export interface ProjectMembersProps {
  projectId: string;
  members: ProjectMember[];
  onMembersChange: () => void;
}

/**
 * Project Members Management
 * 
 * Admin-only section for:
 * - Viewing current members
 * - Adding new members
 * - Changing roles
 * - Removing members
 */
export function ProjectMembers({
  projectId,
  members,
  onMembersChange,
}: ProjectMembersProps) {
  const { supabase, session } = useSupabase();
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState<"client" | "team">("team");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add new member
  const handleAddMember = useCallback(async () => {
    if (!session || !newMemberEmail) return;

    setIsAdding(true);
    setError(null);

    try {
      const token = session.access_token;

      // First, find user by email
      const { data: users } = await supabase
        .from("user_profiles")
        .select("id, email, display_name")
        .eq("email", newMemberEmail.toLowerCase())
        .limit(1);

      if (!users || users.length === 0) {
        throw new Error("User not found. They must have an account first.");
      }

      const userId = users[0].id;

      // Check if already a member
      const existingMember = members.find(m => m.user_id === userId);
      if (existingMember) {
        throw new Error("User is already a member of this project.");
      }

      // Add member via API
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          members: [{ user_id: userId, role: newMemberRole }],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add member");
      }

      // Reset and refresh
      setNewMemberEmail("");
      setShowAddModal(false);
      onMembersChange();

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add member");
    } finally {
      setIsAdding(false);
    }
  }, [session, supabase, projectId, newMemberEmail, newMemberRole, members, onMembersChange]);

  // Remove member
  const handleRemoveMember = useCallback(async (memberId: string) => {
    if (!session) return;
    if (!confirm("Remove this member from the project?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("project_members")
        .delete()
        .eq("id", memberId);

      if (deleteError) throw deleteError;

      onMembersChange();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  }, [session, supabase, onMembersChange]);

  // Get role badge color
  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case "admin": return "bg-red-500/20 text-red-400 border-red-500/30";
      case "team": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "client": return "bg-green-500/20 text-green-400 border-green-500/30";
      default: return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Team Members</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium text-sm flex items-center gap-1.5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {/* Members list */}
      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Member</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Added</th>
              <th className="w-20 px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-medium shrink-0">
                      {member.user_profiles?.display_name?.[0]?.toUpperCase() ||
                       member.user_profiles?.email?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {member.user_profiles?.display_name || "Unknown"}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {member.user_profiles?.email}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor(member.role)}`}>
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400 hidden sm:table-cell">
                  {new Date(member.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  {member.role !== "admin" && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-zinc-400 hover:text-red-400 transition-colors"
                      title="Remove member"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 rounded-2xl border border-zinc-800 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <h3 className="text-lg font-semibold text-white">Add Team Member</h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
                className="p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="team@example.com"
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Role
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as "client" | "team")}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="team">Team Member</option>
                  <option value="client">Client</option>
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900/50">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setError(null);
                }}
                className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={isAdding || !newMemberEmail}
                className="px-6 py-2 bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAdding ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectMembers;
