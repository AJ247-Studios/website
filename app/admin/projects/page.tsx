"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { CreateProjectModal } from "@/components/projects";

type Project = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "completed" | "archived" | "on_hold";
  client_id: string | null;
  shoot_date: string | null;
  deadline: string | null;
  created_at: string;
  media_count?: number;
  member_count?: number;
  client?: {
    full_name: string;
    email: string;
  };
};

const statusConfig = {
  active: { label: "Active", color: "bg-green-500/20 text-green-400" },
  completed: { label: "Completed", color: "bg-blue-500/20 text-blue-400" },
  archived: { label: "Archived", color: "bg-zinc-500/20 text-zinc-400" },
  on_hold: { label: "On Hold", color: "bg-amber-500/20 text-amber-400" },
};

export default function AdminProjectsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [userRole, setUserRole] = useState<string | null>(null);

  // Store session for API calls
  const [session, setSession] = useState<{ access_token: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        router.push("/login");
        return;
      }

      setSession(currentSession);

      // Check user role
      const { data: profile } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", currentSession.user.id)
        .single();

      if (!profile || !["admin", "team"].includes(profile.role)) {
        router.push("/portal");
        return;
      }

      setUserRole(profile.role);
      await loadProjects(currentSession.access_token);
    };

    init();
  }, [router]);

  const loadProjects = async (token?: string) => {
    // Use passed token or current session token
    const accessToken = token || session?.access_token;
    if (!accessToken) {
      console.error("No access token available");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      } else {
        console.error("Failed to load projects:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleProjectCreated = (projectId: string) => {
    // Navigate to the newly created project
    setShowCreateModal(false);
    router.push(`/admin/projects/${projectId}`);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-zinc-400 mt-1">
                Manage your projects and client deliverables
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              New Project
            </button>
          </div>

          {/* Search & Filters */}
          <div className="flex items-center gap-4 mt-6">
            <div className="relative flex-1 max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects or clients..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/50"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-zinc-600 mb-4"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
            <h3 className="text-lg font-medium text-zinc-400">No projects found</h3>
            <p className="text-zinc-500 mt-1">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first project to get started"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors"
              >
                Create Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProjects.map((project) => {
              const status = statusConfig[project.status] || statusConfig.active;

              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/admin/projects/${project.id}`)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                          {project.name}
                        </h3>
                        <span
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
                        >
                          {status.label}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-zinc-400 text-sm mt-1 line-clamp-1">
                          {project.description}
                        </p>
                      )}
                      {project.client && (
                        <p className="text-zinc-500 text-sm mt-2">
                          Client: {project.client.full_name}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // TODO: Add dropdown menu
                      }}
                      className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                  </div>

                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      <span>{project.media_count || 0} files</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-500 text-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                      <span>{project.member_count || 0} members</span>
                    </div>
                    {project.shoot_date && (
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        <span>Shoot: {formatDate(project.shoot_date)}</span>
                      </div>
                    )}
                    {project.deadline && (
                      <div className="flex items-center gap-2 text-zinc-500 text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        <span>Due: {formatDate(project.deadline)}</span>
                      </div>
                    )}
                    <div className="ml-auto text-zinc-600 text-sm">
                      Created {formatDate(project.created_at)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
}
