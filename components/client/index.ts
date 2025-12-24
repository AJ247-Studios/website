/**
 * Client Portal Components
 * 
 * Re-exports all client-facing components for the deliverables review system.
 */

export { default as DeliverablesPanel } from './DeliverablesPanel';
export { default as DeliverableCard } from './DeliverableCard';
export { default as DeliverableModal } from './DeliverableModal';
export { default as CommentsList } from './CommentsList';
export { default as CommentsForm } from './CommentsForm';

// Re-export types for convenience
export type {
  ClientDeliverable,
  DeliverableAsset,
  ClientComment,
  NewCommentData,
  StatusFilter,
  TypeFilter,
  SortOption,
} from '@/lib/types/deliverables';
