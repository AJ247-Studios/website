/**
 * CommentsList Component
 * 
 * Displays a list of comments with threading support, timecode links,
 * and resolution status.
 */

"use client";

import { useState } from "react";
import Image from "next/image";
import { 
  Clock, 
  CheckCircle, 
  Circle,
  Reply,
  User,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import type { ClientComment } from "@/lib/types/deliverables";
import { formatTimecode } from "@/lib/types/deliverables";

interface CommentsListProps {
  comments: ClientComment[];
  onResolve: (commentId: string) => Promise<void>;
  onTimecodeClick?: (timecode: number) => void;
}

export default function CommentsList({
  comments,
  onResolve,
  onTimecodeClick,
}: CommentsListProps) {
  // Build threaded structure
  const rootComments = comments.filter(c => !c.parent_id);
  const repliesMap = new Map<string, ClientComment[]>();
  
  comments.forEach(comment => {
    if (comment.parent_id) {
      const existing = repliesMap.get(comment.parent_id) || [];
      repliesMap.set(comment.parent_id, [...existing, comment]);
    }
  });

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
          <Reply className="w-6 h-6 text-slate-400" />
        </div>
        <p className="text-slate-500 dark:text-slate-400">No comments yet</p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Be the first to leave feedback
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {rootComments.map(comment => (
        <CommentThread
          key={comment.id}
          comment={comment}
          replies={repliesMap.get(comment.id) || []}
          onResolve={onResolve}
          onTimecodeClick={onTimecodeClick}
        />
      ))}
    </div>
  );
}

interface CommentThreadProps {
  comment: ClientComment;
  replies: ClientComment[];
  onResolve: (commentId: string) => Promise<void>;
  onTimecodeClick?: (timecode: number) => void;
  depth?: number;
}

function CommentThread({
  comment,
  replies,
  onResolve,
  onTimecodeClick,
  depth = 0,
}: CommentThreadProps) {
  const [showReplies, setShowReplies] = useState(true);
  const [resolving, setResolving] = useState(false);

  const handleResolve = async () => {
    setResolving(true);
    try {
      await onResolve(comment.id);
    } finally {
      setResolving(false);
    }
  };

  const timeAgo = getTimeAgo(new Date(comment.created_at));

  return (
    <div className={depth > 0 ? 'ml-8 border-l-2 border-slate-100 dark:border-slate-800' : ''}>
      <div className={`p-4 ${comment.resolved ? 'opacity-60' : ''}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            {comment.author.avatar ? (
              <Image
                src={comment.author.avatar}
                alt={comment.author.name}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-900 dark:text-white text-sm">
                  {comment.author.name}
                </span>
                {comment.author.is_team && (
                  <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                    Team
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">{timeAgo}</span>
            </div>
          </div>
          
          {/* Resolve button */}
          {!comment.resolved && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
              title="Mark as resolved"
            >
              {resolving ? (
                <div className="w-4 h-4 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </button>
          )}
          {comment.resolved && (
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          )}
        </div>
        
        {/* Timecode badge */}
        {comment.timecode !== undefined && comment.timecode !== null && (
          <button
            onClick={() => onTimecodeClick?.(comment.timecode!)}
            className="inline-flex items-center gap-1 px-2 py-0.5 mb-2 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
          >
            <Clock className="w-3 h-3" />
            {formatTimecode(comment.timecode)}
          </button>
        )}
        
        {/* Comment body */}
        <p className={`text-sm ${comment.resolved ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
          {comment.body}
        </p>
        
        {/* Replies toggle */}
        {replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 mt-2 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          >
            {showReplies ? (
              <>
                <ChevronUp className="w-3 h-3" />
                Hide {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                Show {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </>
            )}
          </button>
        )}
      </div>
      
      {/* Replies */}
      {showReplies && replies.map(reply => (
        <CommentThread
          key={reply.id}
          comment={reply}
          replies={[]} // Don't support nested replies beyond 1 level
          onResolve={onResolve}
          onTimecodeClick={onTimecodeClick}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
