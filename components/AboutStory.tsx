"use client"

import { useState } from "react";

export default function AboutStory({
  paragraphs,
  signature,
}: {
  paragraphs: string[];
  signature?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-4 text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
      <p>{paragraphs[0]}</p>

      {open &&
        paragraphs.slice(1).map((p, i) => (
          <p key={i}>{p}</p>
        ))}

      <div className="flex items-center justify-between gap-4">
        <div />
        <div className="text-right">
          {signature && (
            <div className="text-sm text-slate-700 dark:text-slate-300 italic">
              {signature}
            </div>
          )}

          <button
            aria-expanded={open}
            onClick={() => setOpen((s) => !s)}
            className="mt-3 inline-flex items-center px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {open ? "Show less" : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
}
