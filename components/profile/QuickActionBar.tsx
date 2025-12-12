/**
 * QuickActionBar Component
 * 
 * Mobile-friendly sticky action bar:
 * - Book / Message / Pay / Download
 * - Pinned for thumb use
 */

"use client";

interface QuickActionBarProps {
  hasUnpaidInvoices: boolean;
  pendingDownloads: number;
  onBook: () => void;
  onMessage: () => void;
  onPay: () => void;
  onDownloadAll: () => void;
}

export function QuickActionBar({
  hasUnpaidInvoices,
  pendingDownloads,
  onBook,
  onMessage,
  onPay,
  onDownloadAll,
}: QuickActionBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
      {/* Gradient fade */}
      <div className="h-6 bg-linear-to-t from-white dark:from-slate-950 to-transparent" />
      
      {/* Action bar */}
      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-3 pb-safe">
        <div className="grid grid-cols-4 gap-2 max-w-lg mx-auto">
          {/* Book */}
          <button
            onClick={onBook}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs font-medium">Book</span>
          </button>

          {/* Message */}
          <button
            onClick={onMessage}
            className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs font-medium">Message</span>
          </button>

          {/* Pay */}
          <button
            onClick={onPay}
            className={`relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
              hasUnpaidInvoices
                ? "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs font-medium">Pay</span>
            {hasUnpaidInvoices && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {/* Download */}
          <button
            onClick={onDownloadAll}
            className={`relative flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-colors ${
              pendingDownloads > 0
                ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-xs font-medium">Download</span>
            {pendingDownloads > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-blue-600 text-white rounded-full flex items-center justify-center">
                {pendingDownloads}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickActionBar;
