/**
 * QuickClientView Component
 * 
 * Slide-over modal for quick client overview:
 * - Recent deliverables
 * - Payment status
 * - Contact info
 * - Recent activity
 */

"use client";

import { useEffect } from "react";
import type { ClientProfile, Project, Deliverable, Invoice } from "@/lib/types/portal";
import { formatCurrency, getStatusColor } from "@/lib/portal-data";

interface QuickClientViewProps {
  client: ClientProfile | null;
  projects: Project[];
  recentDeliverables: Deliverable[];
  pendingInvoices: Invoice[];
  onClose: () => void;
  onViewFullProfile: (clientId: string) => void;
  onSendMessage: (clientId: string) => void;
}

export function QuickClientView({
  client,
  projects,
  recentDeliverables,
  pendingInvoices,
  onClose,
  onViewFullProfile,
  onSendMessage,
}: QuickClientViewProps) {
  // Handle escape key
  useEffect(() => {
    if (!client) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [client, onClose]);

  if (!client) return null;

  const totalOwed = pendingInvoices.reduce((sum, inv) => sum + inv.total_cents, 0);
  const activeProjects = projects.filter(p => !["completed", "cancelled"].includes(p.status));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="client-view-title"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {client.avatar_url ? (
                <img
                  src={client.avatar_url}
                  alt=""
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  <span className="text-lg font-medium text-slate-600 dark:text-slate-300">
                    {client.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h2 id="client-view-title" className="font-semibold text-slate-900 dark:text-white">
                  {client.name}
                </h2>
                {client.company && (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {client.company}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Tags */}
            {client.tags.length > 0 && (
              <div className="flex items-center gap-2 px-4 pt-4">
                {client.tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      tag === "vip"
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                        : tag === "repeat"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {tag.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 p-4">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {projects.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Projects</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activeProjects.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Active</p>
              </div>
              <div className={`rounded-lg p-3 text-center ${
                totalOwed > 0 
                  ? "bg-amber-50 dark:bg-amber-900/20" 
                  : "bg-emerald-50 dark:bg-emerald-900/20"
              }`}>
                <p className={`text-lg font-bold ${
                  totalOwed > 0 
                    ? "text-amber-700 dark:text-amber-300" 
                    : "text-emerald-700 dark:text-emerald-300"
                }`}>
                  {totalOwed > 0 ? formatCurrency(totalOwed) : "Paid"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding</p>
              </div>
            </div>

            {/* Contact info */}
            <div className="px-4 pb-4 space-y-2">
              <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Contact
              </h3>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${client.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                    {client.email}
                  </a>
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <a href={`tel:${client.phone}`} className="text-slate-900 dark:text-white">
                      {client.phone}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Prefers {client.preferences.contact_method}
                </div>
              </div>
            </div>

            {/* Active projects */}
            {activeProjects.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Active Projects
                </h3>
                <div className="space-y-2">
                  {activeProjects.slice(0, 3).map(project => {
                    const statusColors = getStatusColor(project.status);
                    return (
                      <div
                        key={project.id}
                        className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-lg p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {project.title}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {project.deliverables_count} files
                            {project.pending_approvals > 0 && (
                              <span className="text-amber-600"> • {project.pending_approvals} pending</span>
                            )}
                          </p>
                        </div>
                        <span className={`shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${statusColors.bg} ${statusColors.text}`}>
                          {project.status.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent deliverables */}
            {recentDeliverables.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Recent Deliverables
                </h3>
                <div className="grid grid-cols-4 gap-2">
                  {recentDeliverables.slice(0, 4).map(deliverable => (
                    <div key={deliverable.id} className="relative aspect-square rounded-lg overflow-hidden">
                      <img
                        src={deliverable.thumbnail_url}
                        alt={deliverable.title}
                        className="w-full h-full object-cover"
                      />
                      {deliverable.approval_status === "pending" && (
                        <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-yellow-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pending invoices */}
            {pendingInvoices.length > 0 && (
              <div className="px-4 pb-4">
                <h3 className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Pending Invoices
                </h3>
                <div className="space-y-2">
                  {pendingInvoices.map(invoice => {
                    const isOverdue = new Date(invoice.due_date) < new Date();
                    return (
                      <div
                        key={invoice.id}
                        className={`flex items-center justify-between rounded-lg p-3 ${
                          isOverdue 
                            ? "bg-red-50 dark:bg-red-900/20" 
                            : "bg-slate-50 dark:bg-slate-800"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {invoice.invoice_number}
                          </p>
                          <p className={`text-xs ${isOverdue ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}`}>
                            {isOverdue ? "Overdue" : `Due ${new Date(invoice.due_date).toLocaleDateString()}`}
                          </p>
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(invoice.total_cents)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onSendMessage(client.id)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Message
              </button>
              <button
                onClick={() => onViewFullProfile(client.id)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Full Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default QuickClientView;
