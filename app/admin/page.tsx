"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [error, setError] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; email: string; role: string; display_name?: string }>>([])
  const [search, setSearch] = useState("")
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null)
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!data.session) { router.push('/login'); return }
      const token = data.session.access_token
      // Check admin role
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single()
      if (prof?.role !== 'admin') { router.push('/'); return }
      // Load users list
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id, role, display_name')
      const emails: Record<string, string> = {}
      // Fetch emails via auth admin list if available – fallback omitted here
      // For simplicity, try mapping from session user email for self; others will show id
      const usersMapped = (profiles || []).map(p => ({ id: p.id, email: emails[p.id] || p.id, role: p.role, display_name: p.display_name }))
      setUsers(usersMapped)
    }
    init()
  }, [router])

  const setRole = async (userId: string, role: 'guest' | 'client' | 'team' | 'admin') => {
    setRoleUpdating(userId)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ userId, role })
      })
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Failed to update role')
      } else {
        setUsers(u => u.map(x => x.id === userId ? { ...x, role } : x))
      }
    } finally {
      setRoleUpdating(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}
      <div className="mb-6">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search users" className="w-full px-3 py-2 border rounded" />
      </div>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2">User</th>
              <th className="py-2">Role</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(u => (u.email || '').toLowerCase().includes(search.toLowerCase()) || (u.display_name || '').toLowerCase().includes(search.toLowerCase())).map(u => (
              <tr key={u.id} className="border-b">
                <td className="py-2">
                  <div className="font-medium">{u.display_name || u.email || u.id}</div>
                  <div className="text-sm text-slate-600">{u.email}</div>
                </td>
                <td className="py-2"><span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-sm">{u.role}</span></td>
                <td className="py-2">
                  <div className="flex gap-2">
                    {(['guest','client','team','admin'] as const).map(r => (
                      <button key={r} disabled={roleUpdating===u.id} onClick={() => setRole(u.id, r)} className={`px-2 py-1 text-sm rounded ${u.role===r? 'bg-blue-600 text-white':'bg-slate-200 dark:bg-slate-700'}`}>{r}</button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
