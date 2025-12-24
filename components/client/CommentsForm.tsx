/**
 * CommentsForm Component
 * 
 * Form for submitting new comments with optional timecode display.
 */

"use client";

import { useState } from "react";
import { Send, Clock, X, Loader2 } from "lucide-react";
import type { NewCommentData } from "@/lib/types/deliverables";
import { formatTimecode } from "@/lib/types/deliverables";

interface CommentsFormProps {
  onSubmit: (data: NewCommentData) => Promise<void>;
  timecode?: number;
  onClearTimecode?: () => void;
  parentId?: string;
  placeholder?: string;
}

export default function CommentsForm({
  onSubmit,
  timecode,
  onClearTimecode,
  parentId,
  placeholder = "Add a comment...",
}: CommentsFormProps) {
  const [body, setBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!body.trim()) {
      setError('Please enter a comment');
      return;
    }
    
    if (body.trim().length < 2) {
      setError('Comment must be at least 2 characters');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await onSubmit({
        body: body.trim(),
        timecode,
        parent_id: parentId,
      });
      setBody('');
      onClearTimecode?.();
    } catch (err: any) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      {/* Timecode badge */}
      {timecode !== undefined && (
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
            <Clock className="w-3 h-3" />
            Commenting at {formatTimecode(timecode)}
          </span>
          <button
            type="button"
            onClick={onClearTimecode}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-2 text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}
      
      {/* Input */}
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              if (error) setError(null);
            }}
            placeholder={placeholder}
            rows={2}
            disabled={isSubmitting}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit(e);
              }
            }}
          />
          <p className="text-xs text-slate-400 mt-1">
            Press ⌘+Enter to send
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !body.trim()}
          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}
