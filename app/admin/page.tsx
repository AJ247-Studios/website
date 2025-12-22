"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";
import {
  KpiRow,
  AlertsFeed,
  ProjectsTable,
  QuickClientView,
  SystemTasks,
} from "@/components/admin";
import {
  mockAdminKpis,
  mockAdminAlerts,
  mockClientProfile,
  mockProjects,
  mockDeliverables,
  mockInvoices,
  mockSystemTasks,
} from "@/lib/portal-data";
import type { ClientProfile, Project, Deliverable, Invoice } from "@/lib/types/portal";

/**
 * Admin Dashboard Page
 * 
 * Protected by middleware - only accessible to users with role='admin'
 * Includes:
 * - KPI overview (revenue, bookings, projects, invoices, messages)
 * - Alerts stream
 * - Projects table with bulk actions
 * - Quick client view slide-over
 * - System tasks & storage
 * - User role management
 */
export default function AdminPage() {
  const { supabase, session, role } = useSupabase();
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; email: string; role: string; display_name?: string }>>([]);
  const [search, setSearch] = useState("");
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");
  
  // Quick client view state
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [clientProjects, setClientProjects] = useState<Project[]>([]);
  const [clientDeliverables, setClientDeliverables] = useState<Deliverable[]>([]);
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([]);
  
  const router = useRouter();

  // Show "session expired" option after 2 seconds of loading
  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => {
        setShowSessionExpired(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSessionExpired(false);
    }
  }, [loading]);

  // Function to clear cookies and redirect to login
  const handleClearSession = () => {
    // Clear all Supabase cookies by setting them to expire
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName.startsWith("sb-")) {
        // Clear with multiple path variants to ensure removal
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      }
    }
    // Force a hard redirect to clear any cached state
    window.location.href = "/login";
  };

  // Redirect is handled by middleware, but we double-check here
  useEffect(() => {
    if (session === null) {
      // Small delay to ensure we're not redirecting during hydration
      const timer = setTimeout(() => {
        router.push("/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [session, role, router]);

  // Load users on mount (middleware ensures user is admin)
  useEffect(() => {
    // If no session, stop loading (middleware will redirect)
    if (!session) {
      setLoading(false);
      return;
    }

    const loadUsers = async () => {
      try {
        // Load users list from user_profiles table
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select('id, role, display_name');
        
        if (profilesError) {
          setError("Failed to load users: " + profilesError.message);
          setUsers([]);
        } else {
          const usersMapped = (profiles || []).map(p => ({
            id: p.id,
            email: p.id,
            role: p.role || 'user',
            display_name: p.display_name
          }));
          setUsers(usersMapped);
        }
      } catch (err) {
        setError("Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [session, supabase]);

  const setRole = async (userId: string, newRole: 'guest' | 'client' | 'team' | 'admin' | 'user') => {
    setRoleUpdating(userId);
    setError("");
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({ userId, role: newRole })
      });
      
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to update role');
      } else {
        setUsers(u => u.map(x => x.id === userId ? { ...x, role: newRole } : x));
      }
    } catch (err) {
      setError('Failed to update role');
    } finally {
      setRoleUpdating(null);
    }
  };

  // Handle opening quick client view
  const handleOpenClientView = (clientId: string) => {
    // In production, fetch client data by ID
    // For now, use mock data
    setSelectedClient(mockClientProfile);
    setClientProjects(mockProjects);
    setClientDeliverables(mockDeliverables);
    setClientInvoices(mockInvoices.filter(i => i.status !== "paid"));
  };

  const handleCloseClientView = () => {
    setSelectedClient(null);
    setClientProjects([]);
    setClientDeliverables([]);
    setClientInvoices([]);
  };

  const handleViewFullProfile = (clientId: string) => {
    router.push(`/admin/clients/${clientId}`);
  };

  const handleSendMessage = (clientId: string) => {
    // Open message modal or navigate to messages
    console.log("Send message to:", clientId);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading admin dashboard...</p>
          {showSessionExpired && (
            <div className="mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Taking too long? Your session may have expired.
              </p>
              <button
                onClick={handleClearSession}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm font-medium"
              >
                Click here to re-login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your studio operations
          </p>
        </div>
        
        {/* Tab navigation */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "overview"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => router.push("/admin/projects")}
            className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === "users"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {activeTab === "overview" ? (
        <div className="space-y-6">
          {/* KPIs */}
          <KpiRow kpis={mockAdminKpis} />

          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Projects table - spans 2 cols */}
            <div className="lg:col-span-2">
              <ProjectsTable
                projects={mockProjects}
                onViewClient={handleOpenClientView}
                onViewProject={(projectId) => router.push(`/admin/projects/${projectId}`)}
                onBulkAction={(action, projectIds) => {
                  console.log("Bulk action:", action, projectIds);
                }}
              />
            </div>

            {/* Right sidebar */}
            <div className="space-y-6">
              {/* Alerts */}
              <AlertsFeed
                alerts={mockAdminAlerts}
                onDismiss={(alertId) => console.log("Dismiss:", alertId)}
                onAction={(alert) => console.log("Action:", alert)}
              />

              {/* System tasks */}
              <SystemTasks
                tasks={mockSystemTasks}
                storage={{
                  used_gb: 847,
                  total_gb: 1000,
                  breakdown: { videos: 620, images: 180, documents: 35, other: 12 },
                }}
                onRetryTask={(taskId) => console.log("Retry:", taskId)}
                onCancelTask={(taskId) => console.log("Cancel:", taskId)}
              />
            </div>
          </div>
        </div>
      ) : (
        /* User Management Tab */
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <th className="py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Change Role
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {users
                  .filter(u =>
                    (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                    (u.display_name || '').toLowerCase().includes(search.toLowerCase())
                  )
                  .map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                              {(u.display_name || u.email || 'U').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {u.display_name || 'No name'}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {u.email || u.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                            : u.role === 'team'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : u.role === 'client'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2 flex-wrap">
                          {(['user', 'client', 'team', 'admin'] as const).map(r => (
                            <button
                              key={r}
                              disabled={roleUpdating === u.id || u.role === r}
                              onClick={() => setRole(u.id, r)}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                u.role === r
                                  ? 'bg-blue-600 text-white cursor-default'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                              } ${roleUpdating === u.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-slate-500 dark:text-slate-400">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Client View Slide-over */}
      <QuickClientView
        client={selectedClient}
        projects={clientProjects}
        recentDeliverables={clientDeliverables}
        pendingInvoices={clientInvoices}
        onClose={handleCloseClientView}
        onViewFullProfile={handleViewFullProfile}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
