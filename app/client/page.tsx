/**
 * Client Portal Dashboard
 * 
 * Lists all projects the client has access to.
 * Redirects to login if not authenticated.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { NotificationBell } from "@/components/portal";

interface ClientProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  project_type?: string;
  shoot_date?: string;
  deadline?: string;
  deliverables_count?: number;
  pending_review?: number;
}

export default function ClientPortalDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push('/login?redirect=/client');
        return;
      }

      // For now, fetch from supabase directly (RLS will filter)
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          id,
          title,
          description,
          status,
          project_type,
          shoot_date,
          deadline
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProjects(data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      quote: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
      approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      delivered: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      paid: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      archived: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500',
    };
    return colors[status] || colors.quote;
  };

  const formatStatus = (status: string) => {
    const labels: Record<string, string> = {
      quote: 'Quote',
      approved: 'Approved',
      in_progress: 'In Progress',
      review: 'Under Review',
      delivered: 'Delivered',
      paid: 'Completed',
      archived: 'Archived',
    };
    return labels[status] || status;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              My Projects
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
              View and manage your project deliverables
            </p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell />
            <a
              href="/contact"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Start New Project
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
            <p className="text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={fetchProjects}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No projects yet
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Ready to start something amazing? Get in touch with us!
            </p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start a Project
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => router.push(`/client/projects/${project.id}`)}
                className="w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 text-left hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h2>
                      <span className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                    </div>
                    {project.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
                      {project.project_type && (
                        <span className="capitalize">{project.project_type}</span>
                      )}
                      {project.shoot_date && (
                        <span>
                          Shoot: {new Date(project.shoot_date).toLocaleDateString()}
                        </span>
                      )}
                      {project.deadline && (
                        <span>
                          Deadline: {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                    <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
