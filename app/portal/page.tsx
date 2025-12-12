/**
 * Client Portal Page
 * 
 * Deliverables-first layout with:
 * - ClientHero with welcome, stats, quick actions
 * - RecentDeliverables with approve/request change flow
 * - ProjectTimeline with status badges
 * - InvoicesPanel with pay now buttons
 * - ActivityFeed
 * - UploadsPanel
 * - Lightbox for media preview
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import {
  ClientHero,
  RecentDeliverables,
  ProjectTimeline,
  InvoicesPanel,
  ActivityFeed,
  UploadsPanel,
  PortalLightbox,
} from "@/components/portal";
import type { Deliverable, ClientUpload } from "@/lib/types/portal";
import {
  getClientPortalData,
  mockDeliverables,
} from "@/lib/portal-data";

export default function ClientPortalPage() {
  const router = useRouter();
  const { session, isLoading } = useSupabase();
  
  // State
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [deliverables, setDeliverables] = useState(mockDeliverables);
  const [uploads, setUploads] = useState<ClientUpload[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login?redirect=/portal");
    }
  }, [session, isLoading, router]);

  // Get portal data (in real app, fetch from API)
  const clientId = session?.user?.id || "client_001";
  const portalData = getClientPortalData(clientId);

  // Calculate pending approvals from deliverables
  const pendingApprovals = deliverables.filter(d => d.approval_status === "pending").length;

  // Handlers
  const handleApprove = useCallback((id: string) => {
    setDeliverables(prev => 
      prev.map(d => d.id === id ? { ...d, approval_status: "approved" as const } : d)
    );
    
    // Also update lightbox if open
    setSelectedDeliverable(prev => 
      prev?.id === id ? { ...prev, approval_status: "approved" as const } : prev
    );

    // Analytics
    // analytics.track("deliverable_approved", { deliverable_id: id });

    // TODO: API call
    // await fetch(`/api/client/${clientId}/deliverables/${id}/approve`, { method: 'POST' });
  }, []);

  const handleRequestRevision = useCallback((id: string, comment?: string) => {
    setDeliverables(prev => 
      prev.map(d => {
        if (d.id !== id) return d;
        return {
          ...d,
          approval_status: "revision_requested" as const,
          annotations: comment 
            ? [...d.annotations, {
                id: `ann_${Date.now()}`,
                author_id: clientId,
                author_name: portalData.client.name,
                text: comment,
                created_at: new Date().toISOString(),
                resolved: false,
              }]
            : d.annotations,
        };
      })
    );

    setSelectedDeliverable(null);

    // Analytics
    // analytics.track("deliverable_revision_requested", { deliverable_id: id });

    // TODO: API call
  }, [clientId, portalData.client.name]);

  const handleDownload = useCallback((id: string) => {
    const deliverable = deliverables.find(d => d.id === id);
    if (deliverable?.download_url_signed) {
      window.open(deliverable.download_url_signed, "_blank");
    }

    // Analytics
    // analytics.track("deliverable_downloaded", { deliverable_id: id });
  }, [deliverables]);

  const handleOpenLightbox = useCallback((deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setSelectedDeliverable(null);
  }, []);

  const handleLightboxNav = useCallback((direction: "prev" | "next") => {
    if (!selectedDeliverable) return;
    const currentIndex = deliverables.findIndex(d => d.id === selectedDeliverable.id);
    const newIndex = direction === "prev" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex >= 0 && newIndex < deliverables.length) {
      setSelectedDeliverable(deliverables[newIndex]);
    }
  }, [selectedDeliverable, deliverables]);

  const handleViewProject = useCallback((projectId: string) => {
    // TODO: Navigate to project detail page
    console.log("View project:", projectId);
  }, []);

  const handlePayNow = useCallback((invoiceId: string, paymentUrl: string) => {
    // Analytics
    // analytics.track("invoice_pay_clicked", { invoice_id: invoiceId });
    window.open(paymentUrl, "_blank");
  }, []);

  const handleDownloadPdf = useCallback((invoiceId: string) => {
    // TODO: Generate/fetch PDF URL
    console.log("Download PDF:", invoiceId);
  }, []);

  const handleUpload = useCallback(async (files: File[]) => {
    // Simulate upload (in real app, use chunked upload to API)
    for (const file of files) {
      const newUpload: ClientUpload = {
        id: `upload_${Date.now()}`,
        project_id: portalData.projects[0]?.id || "proj_001",
        client_id: clientId,
        filename: file.name,
        file_type: file.type,
        file_size: file.size,
        url: URL.createObjectURL(file),
        status: "ready",
        created_at: new Date().toISOString(),
      };
      setUploads(prev => [newUpload, ...prev]);
    }

    // Analytics
    // analytics.track("files_uploaded", { count: files.length });
  }, [clientId, portalData.projects]);

  const handleDeleteUpload = useCallback((uploadId: string) => {
    setUploads(prev => prev.filter(u => u.id !== uploadId));
  }, []);

  const handleDownloadAll = useCallback(() => {
    // TODO: Generate ZIP download
    // analytics.track("download_all_clicked");
    console.log("Download all deliverables");
  }, []);

  const handleBookSession = useCallback(() => {
    // Open Calendly or booking page
    window.open("https://calendly.com/aj247studios", "_blank");
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your portal...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null; // Will redirect
  }

  const currentDeliverableIndex = selectedDeliverable 
    ? deliverables.findIndex(d => d.id === selectedDeliverable.id)
    : -1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero with client info and quick actions */}
        <ClientHero
          client={portalData.client}
          nextShootDate={portalData.nextShootDate}
          totalOwed={portalData.totalOwed}
          pendingApprovals={pendingApprovals}
          onDownloadAll={handleDownloadAll}
          onBookSession={handleBookSession}
        />

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Deliverables - Hero of the portal */}
            <RecentDeliverables
              deliverables={deliverables}
              onApprove={handleApprove}
              onRequestRevision={(id) => handleRequestRevision(id)}
              onDownload={handleDownload}
              onOpenLightbox={handleOpenLightbox}
            />

            {/* Project Timeline */}
            <ProjectTimeline
              projects={portalData.projects}
              onViewProject={handleViewProject}
            />

            {/* Client Uploads */}
            <UploadsPanel
              projectId={portalData.projects[0]?.id || ""}
              uploads={uploads}
              onUpload={handleUpload}
              onDelete={handleDeleteUpload}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Invoices */}
            <InvoicesPanel
              invoices={portalData.pendingInvoices}
              onPayNow={handlePayNow}
              onDownloadPdf={handleDownloadPdf}
            />

            {/* Activity Feed */}
            <ActivityFeed
              activities={portalData.recentActivity}
              maxItems={5}
            />
          </div>
        </div>
      </main>

      {/* Lightbox */}
      <PortalLightbox
        deliverable={selectedDeliverable}
        onClose={handleCloseLightbox}
        onApprove={handleApprove}
        onRequestRevision={handleRequestRevision}
        onDownload={handleDownload}
        onPrevious={() => handleLightboxNav("prev")}
        onNext={() => handleLightboxNav("next")}
        hasPrevious={currentDeliverableIndex > 0}
        hasNext={currentDeliverableIndex < deliverables.length - 1}
      />
    </div>
  );
}
