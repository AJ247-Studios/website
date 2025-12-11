"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import YouTubeEmbed from "@/components/YouTubeEmbed";

type PortalMedia = {
  id: string;
  type: "photo" | "video" | "youtube";
  url?: string;
  youtube_id?: string;
  title?: string;
  description?: string;
  category?: string;
};

type Invoice = {
  id: string;
  number: string;
  amount_cents: number;
  status: string;
  link_url?: string;
  issued_at?: string;
  due_at?: string;
};

type Project = {
  id: string;
  name: string;
  details?: string;
};

export default function ClientPortalPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<PortalMedia[]>([]);
  const [videos, setVideos] = useState<PortalMedia[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) { router.push('/login'); return }
      try {
        const res = await fetch(`/api/portal/${projectId}`);
        if (!res.ok) {
          const body = await res.json();
          setError(body.error || 'Failed to load portal');
          return;
        }
        const payload = await res.json();
        setProject(payload.project);
        setPhotos(payload.media.filter((m: PortalMedia) => m.type === 'photo'));
        setVideos(payload.media.filter((m: PortalMedia) => m.type !== 'photo'));
        setInvoices(payload.invoices || []);
      } catch (e: any) {
        setError(e.message || 'Failed to load portal');
      } finally {
        setLoading(false);
      }
    };
    if (projectId) init();
  }, [projectId, router]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-10">Loading portal…</div>;
  if (error) return <div className="max-w-5xl mx-auto px-4 py-10 text-red-600">{error}</div>;
  if (!project) return <div className="max-w-5xl mx-auto px-4 py-10">Project not found.</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
      <header>
        <h1 className="text-3xl font-bold">{project.name}</h1>
        {project.details && <p className="text-slate-600 mt-2">{project.details}</p>}
      </header>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Photo Gallery</h2>
        {photos.length === 0 ? (
          <p className="text-slate-600">No photos yet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {photos.map((m) => (
              <figure key={m.id} className="rounded overflow-hidden border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.url} alt={m.title || ''} className="w-full h-48 object-cover" />
                {m.title && <figcaption className="p-2 text-sm">{m.title}</figcaption>}
              </figure>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Video Gallery</h2>
        {videos.length === 0 ? (
          <p className="text-slate-600">No videos yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {videos.map((m) => (
              <div key={m.id} className="rounded overflow-hidden border">
                {m.type === 'youtube' && m.youtube_id ? (
                  <YouTubeEmbed videoId={m.youtube_id} />
                ) : (
                  <video src={m.url} controls className="w-full h-64 object-cover" />
                )}
                {m.title && <div className="p-2 text-sm">{m.title}</div>}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-slate-600">No invoices available.</p>
        ) : (
          <ul className="space-y-2">
            {invoices.map(inv => (
              <li key={inv.id} className="p-3 border rounded flex items-center justify-between">
                <div>
                  <div className="font-medium">Invoice {inv.number}</div>
                  <div className="text-sm text-slate-600">{(inv.amount_cents/100).toLocaleString(undefined,{style:'currency',currency:'USD'})} • {inv.status}</div>
                </div>
                {inv.link_url && <a className="px-3 py-2 bg-blue-600 text-white rounded" href={inv.link_url} target="_blank" rel="noreferrer">View</a>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">AI Assistant</h2>
        <p className="text-slate-600 mb-2">Chat with us about this project. Clients have full access.</p>
        {/* The site’s ChatWidget can be used here if desired */}
      </section>
    </div>
  );
}
