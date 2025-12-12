/**
 * BillingWidget Component
 * 
 * Compact billing widget showing:
 * - Outstanding invoices with pay-now button
 * - Recent paid receipts
 * - Stripe payment integration
 */

"use client";

import { useState } from "react";
import type { Invoice } from "@/lib/types/portal";

interface BillingWidgetProps {
  invoices: Invoice[];
  onPay: (invoiceId: string) => void;
  onViewReceipt: (invoiceId: string) => void;
  onViewAll?: () => void;
}

export function BillingWidget({
  invoices,
  onPay,
  onViewReceipt,
  onViewAll,
}: BillingWidgetProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const unpaidInvoices = invoices.filter((inv) =>
    ["sent", "viewed", "overdue"].includes(inv.status)
  );
  const paidInvoices = invoices.filter((inv) => inv.status === "paid").slice(0, 3);

  const totalOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.total_cents, 0);

  const formatCurrency = (cents: number, currency = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            Billing
          </h3>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View all →
            </button>
          )}
        </div>
        {totalOutstanding > 0 && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {formatCurrency(totalOutstanding)} outstanding
          </p>
        )}
      </div>

      {/* Outstanding invoices */}
      {unpaidInvoices.length > 0 ? (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {unpaidInvoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              isExpanded={expandedId === invoice.id}
              onToggle={() =>
                setExpandedId(expandedId === invoice.id ? null : invoice.id)
              }
              onPay={() => onPay(invoice.id)}
            />
          ))}
        </div>
      ) : (
        <div className="p-6 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-emerald-600 dark:text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-slate-600 dark:text-slate-400">All paid up!</p>
        </div>
      )}

      {/* Recent receipts */}
      {paidInvoices.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Recent Receipts
            </p>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {paidInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {invoice.invoice_number}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Paid {invoice.paid_at ? formatDate(invoice.paid_at) : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(invoice.total_cents, invoice.currency)}
                  </span>
                  <button
                    onClick={() => onViewReceipt(invoice.id)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                    title="Download receipt"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trust badge */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Secure payments via Stripe</span>
        </div>
      </div>
    </section>
  );
}

interface InvoiceRowProps {
  invoice: Invoice;
  isExpanded: boolean;
  onToggle: () => void;
  onPay: () => void;
}

function InvoiceRow({ invoice, isExpanded, onToggle, onPay }: InvoiceRowProps) {
  const isOverdue = invoice.status === "overdue";
  const daysUntilDue = Math.ceil(
    (new Date(invoice.due_date).getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  const formatCurrency = (cents: number, currency = "PLN") => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  };

  return (
    <div className="bg-white dark:bg-slate-900">
      {/* Main row */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
          isOverdue ? "bg-red-50/50 dark:bg-red-900/10" : ""
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-2 h-2 rounded-full shrink-0 ${
              isOverdue
                ? "bg-red-500"
                : daysUntilDue <= 7
                ? "bg-amber-500"
                : "bg-blue-500"
            }`}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
              {invoice.invoice_number}
            </p>
            <p
              className={`text-xs ${
                isOverdue
                  ? "text-red-600 dark:text-red-400 font-medium"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {isOverdue
                ? `Overdue by ${Math.abs(daysUntilDue)} days`
                : daysUntilDue <= 0
                ? "Due today"
                : `Due in ${daysUntilDue} days`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">
            {formatCurrency(invoice.total_cents, invoice.currency)}
          </span>
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="px-4 pb-4 bg-slate-50 dark:bg-slate-800/30">
          {/* Line items */}
          {invoice.line_items.length > 0 && (
            <div className="mb-4 space-y-2">
              {invoice.line_items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-slate-600 dark:text-slate-400">
                    {item.description}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                  <span className="text-slate-900 dark:text-white">
                    {formatCurrency(item.total_cents, invoice.currency)}
                  </span>
                </div>
              ))}
              {invoice.tax_cents > 0 && (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">
                    VAT
                  </span>
                  <span className="text-slate-600 dark:text-slate-300">
                    {formatCurrency(invoice.tax_cents, invoice.currency)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Pay button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPay();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-white rounded-lg transition-colors ${
              isOverdue
                ? "bg-red-600 hover:bg-red-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
            Pay invoice — secure
          </button>
        </div>
      )}
    </div>
  );
}

export default BillingWidget;
