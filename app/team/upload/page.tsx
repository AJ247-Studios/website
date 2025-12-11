"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Project = { id: string; name: string };

export default function TeamUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [youtubeId, setYoutubeId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.push('/login'); return }
      // role check
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.session.user.id)
        .single();
      const role = profile?.role || 'guest';
      if (!(role === 'team' || role === 'admin')) { router.push('/'); return }
      // load projects (simple open list; RLS should limit)
      const { data: projList } = await supabase
        .from('projects')
        .select('id,name')
        .order('name');
      setProjects(projList || []);
      setLoading(false);
    };
    init();
  }, [router]);

  const canSubmit = useMemo(() => !!projectId && (!!file || !!youtubeId) && !submitting, [projectId, file, youtubeId, submitting])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) { setError('Select a project'); return }
    if (!file && !youtubeId) { setError('Provide a file or YouTube ID'); return }
    setError("");
    setSubmitting(true);
    try {
      const form = new FormData();
      if (file) form.append('file', file);
      if (title) form.append('title', title);
      if (description) form.append('description', description);
      if (category) form.append('category', category);
      if (youtubeId) form.append('youtube_id', youtubeId);
      const res = await fetch(`/api/portal/${projectId}/upload`, { method:'POST', body: form });
      if (!res.ok) {
        const body = await res.json();
        setError(body.error || 'Upload failed');
      } else {
        setTitle(""); setDescription(""); setCategory(""); setYoutubeId(""); setFile(null);
        const el = document.getElementById('file') as HTMLInputElement | null; if (el) el.value = "";
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="max-w-4xl mx-auto px-4 py-10">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-3xl font-bold">Team Upload Portal</h1>
      {error && <div className="text-red-600">{error}</div>}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project</label>
          <select value={projectId} onChange={e=>setProjectId(e.target.value)} className="w-full border rounded px-3 py-2">
            <option value="">Select a project…</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">File (photo/video)</label>
            <input id="file" type="file" accept="image/*,video/*" onChange={e=>setFile(e.target.files?.[0]||null)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">YouTube ID (optional)</label>
            <input value={youtubeId} onChange={e=>setYoutubeId(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="e.g. dQw4w9WgXcQ" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input value={category} onChange={e=>setCategory(e.target.value)} className="w-full border rounded px-3 py-2" placeholder="Sports, Restaurant, Weddings…" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <button type="submit" disabled={!canSubmit} className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
          {submitting ? 'Uploading…' : 'Upload to Project'}
        </button>
      </form>
    </div>
  );
}
