"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";

/**
 * Admin Dashboard Page
 * 
 * Protected by middleware - only accessible to users with role='admin'
 * The middleware handles authentication and role checking,
 * so this page can focus on admin functionality.
 */
export default function AdminPage() {
  const { supabase, session, role } = useSupabase();
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; email: string; role: string; display_name?: string }>>([]);
  const [search, setSearch] = useState("");
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
          console.error("[AdminPage] Error loading profiles:", profilesError.message);
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
        console.error("[AdminPage] Error loading users:", err);
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

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 text-sm">{error}</div>}
      <div className="mb-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search users"
          className="w-full px-3 py-2 border rounded dark:bg-slate-700 dark:border-slate-600"
        />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b dark:border-slate-700">
              <th className="py-2">User</th>
              <th className="py-2">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(u =>
                (u.email || '').toLowerCase().includes(search.toLowerCase()) ||
                (u.display_name || '').toLowerCase().includes(search.toLowerCase())
              )
              .map(u => (
                <tr key={u.id} className="border-b dark:border-slate-700">
                  <td className="py-2">
                    <div className="font-medium">{u.display_name || u.email || u.id}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{u.email}</div>
                  </td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-sm">{u.role}</span>
                  </td>
                  <td className="py-2">
                    <div className="flex gap-2 flex-wrap">
                      {(['user', 'client', 'team', 'admin'] as const).map(r => (
                        <button
                          key={r}
                          disabled={roleUpdating === u.id}
                          onClick={() => setRole(u.id, r)}
                          className={`px-2 py-1 text-sm rounded transition-colors ${
                            u.role === r
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
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
          <p className="text-center py-4 text-slate-600 dark:text-slate-400">No users found</p>
        )}
      </div>
    </div>
  );
}
