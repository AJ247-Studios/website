/**
 * InvoicesPanel Component
 * 
 * Shows invoices with:
 * - Status badges (sent, viewed, paid, overdue)
 * - Pay Now button with Stripe integration
 * - Download receipt/PDF
 * - Mini forecast for unpaid amounts
 */

"use client";

import type { Invoice } from "@/lib/types/portal";
import { formatCurrency, getStatusColor } from "@/lib/portal-data";

interface InvoicesPanelProps {
  invoices: Invoice[];
  onPayNow: (invoiceId: string, paymentUrl: string) => void;
  onDownloadPdf: (invoiceId: string) => void;
}

export function InvoicesPanel({ invoices, onPayNow, onDownloadPdf }: InvoicesPanelProps) {
  const pendingInvoices = invoices.filter(inv => inv.status !== "paid" && inv.status !== "cancelled");
  const paidInvoices = invoices.filter(inv => inv.status === "paid");
  const totalOutstanding = pendingInvoices.reduce((sum, inv) => sum + inv.total_cents, 0);
  const nextDue = pendingInvoices
    .filter(inv => inv.due_date)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())[0];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Invoices
        </h2>
        <a
          href="#all-invoices"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View all →
        </a>
      </div>

      {/* Summary card */}
      {pendingInvoices.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm text-amber-700 dark:text-amber-400 mb-1">
                Outstanding Balance
              </p>
              <p className="text-2xl font-bold text-amber-900 dark:text-amber-200">
                {formatCurrency(totalOutstanding)}
              </p>
              {nextDue && (
                <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">
                  Next payment due {formatDueDate(nextDue.due_date)}
                </p>
              )}
            </div>
            {nextDue?.payment_url && (
              <button
                onClick={() => onPayNow(nextDue.id, nextDue.payment_url!)}
                className="shrink-0 px-5 py-2.5 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors"
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      )}

      {/* Invoice list */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Pending invoices */}
        {pendingInvoices.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Pending ({pendingInvoices.length})
              </span>
            </div>
            {pendingInvoices.map((invoice, index) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onPayNow={() => invoice.payment_url && onPayNow(invoice.id, invoice.payment_url)}
                onDownloadPdf={() => onDownloadPdf(invoice.id)}
                isLast={index === pendingInvoices.length - 1 && paidInvoices.length === 0}
              />
            ))}
          </div>
        )}

        {/* Paid invoices */}
        {paidInvoices.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Paid ({paidInvoices.length})
              </span>
            </div>
            {paidInvoices.slice(0, 3).map((invoice, index) => (
              <InvoiceRow
                key={invoice.id}
                invoice={invoice}
                onDownloadPdf={() => onDownloadPdf(invoice.id)}
                isLast={index === Math.min(paidInvoices.length, 3) - 1}
              />
            ))}
          </div>
        )}

        {invoices.length === 0 && (
          <div className="p-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 dark:text-slate-400">No invoices yet</p>
          </div>
        )}
      </div>
    </section>
  );
}

interface InvoiceRowProps {
  invoice: Invoice;
  onPayNow?: () => void;
  onDownloadPdf: () => void;
  isLast?: boolean;
}

function InvoiceRow({ invoice, onPayNow, onDownloadPdf, isLast }: InvoiceRowProps) {
  const statusColors = getStatusColor(invoice.status);
  const isOverdue = invoice.status === "overdue" || 
    (invoice.status === "sent" && new Date(invoice.due_date) < new Date());

  return (
    <div className={`flex items-center gap-4 p-4 ${!isLast ? "border-b border-slate-100 dark:border-slate-800" : ""}`}>
      {/* Invoice info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-slate-900 dark:text-white">
            {invoice.invoice_number}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${
            isOverdue 
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" 
              : `${statusColors.bg} ${statusColors.text}`
          }`}>
            {isOverdue ? "Overdue" : formatInvoiceStatus(invoice.status)}
          </span>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {invoice.line_items.length} {invoice.line_items.length === 1 ? "item" : "items"}
          {invoice.due_date && invoice.status !== "paid" && (
            <> • Due {formatDueDate(invoice.due_date)}</>
          )}
          {invoice.paid_at && (
            <> • Paid {formatDueDate(invoice.paid_at)}</>
          )}
        </p>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className="font-semibold text-slate-900 dark:text-white">
          {formatCurrency(invoice.total_cents, invoice.currency)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {onPayNow && invoice.payment_url && invoice.status !== "paid" && (
          <button
            onClick={onPayNow}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Pay
          </button>
        )}
        <button
          onClick={onDownloadPdf}
          className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Download PDF"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function formatInvoiceStatus(status: string): string {
  const labels: Record<string, string> = {
    draft: "Draft",
    sent: "Sent",
    viewed: "Viewed",
    paid: "Paid",
    overdue: "Overdue",
    cancelled: "Cancelled",
    refunded: "Refunded",
  };
  return labels[status] || status;
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays < 7) return `in ${diffDays} days`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default InvoicesPanel;
