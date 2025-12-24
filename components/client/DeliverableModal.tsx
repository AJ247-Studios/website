/**
 * DeliverableModal Component
 * 
 * Full-screen modal for viewing deliverable assets and managing review workflow.
 * Features:
 * - Image/video viewer with zoom/fullscreen
 * - Video player with timecode comments
 * - Comments sidebar with threading
 * - Approve/request changes actions
 * - Asset navigation
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  MessageSquare,
  Check,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from "lucide-react";
import CommentsList from "./CommentsList";
import CommentsForm from "./CommentsForm";
import type { 
  ClientDeliverable, 
  DeliverableAsset,
  ClientComment,
  NewCommentData 
} from "@/lib/types/deliverables";
import { STATUS_CONFIG, formatTimecode } from "@/lib/types/deliverables";

interface DeliverableModalProps {
  deliverable: ClientDeliverable;
  initialAssetIndex?: number;
  comments: ClientComment[];
  onClose: () => void;
  onApprove: () => Promise<void>;
  onRequestChange: (reason: string) => Promise<void>;
  onAddComment: (data: NewCommentData) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function DeliverableModal({
  deliverable,
  initialAssetIndex = 0,
  comments,
  onClose,
  onApprove,
  onRequestChange,
  onAddComment,
  onResolveComment,
  isLoading = false,
}: DeliverableModalProps) {
  // Asset navigation
  const [currentAssetIndex, setCurrentAssetIndex] = useState(initialAssetIndex);
  const currentAsset = deliverable.assets?.[currentAssetIndex];
  
  // Video player state
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Image viewer state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  
  // Comments panel state
  const [showComments, setShowComments] = useState(true);
  const [commentTimecode, setCommentTimecode] = useState<number | undefined>();
  
  // Change request dialog
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  
  const statusConfig = STATUS_CONFIG[deliverable.status];
  const canReview = deliverable.status === 'delivered';
  const isVideo = currentAsset?.file_type === 'video';
  const isImage = currentAsset?.file_type === 'image';
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigatePrev();
      if (e.key === 'ArrowRight') navigateNext();
      if (e.key === ' ' && isVideo) {
        e.preventDefault();
        togglePlay();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentAssetIndex, deliverable.assets?.length, isVideo]);
  
  // Video time update
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleEnded = () => setIsPlaying(false);
    
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [currentAsset]);
  
  const navigatePrev = () => {
    if (currentAssetIndex > 0) {
      setCurrentAssetIndex(currentAssetIndex - 1);
      resetViewer();
    }
  };
  
  const navigateNext = () => {
    if (deliverable.assets && currentAssetIndex < deliverable.assets.length - 1) {
      setCurrentAssetIndex(currentAssetIndex + 1);
      resetViewer();
    }
  };
  
  const resetViewer = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setIsPlaying(false);
    setCurrentTime(0);
  };
  
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };
  
  const seekTo = (time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };
  
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    seekTo(percent * duration);
  };
  
  const handleAddComment = async (data: NewCommentData) => {
    // Add current video timecode if commenting on video
    if (isVideo && commentTimecode !== undefined) {
      data.timecode = commentTimecode;
    }
    
    // Add deliverable context
    data.deliverable_id = deliverable.id;
    if (currentAsset) {
      data.media_asset_id = currentAsset.media_asset_id;
    }
    
    await onAddComment(data);
    setCommentTimecode(undefined);
  };
  
  const handleCommentAtTimecode = () => {
    if (isVideo) {
      const video = videoRef.current;
      if (video) {
        video.pause();
        setIsPlaying(false);
        setCommentTimecode(video.currentTime);
      }
    }
  };
  
  const handleTimecodeClick = (timecode: number) => {
    if (isVideo) {
      seekTo(timecode);
    }
  };
  
  const handleSubmitChange = async () => {
    if (changeReason.trim().length >= 10) {
      await onRequestChange(changeReason);
      setShowChangeDialog(false);
      setChangeReason('');
    }
  };
  
  // Filter comments for current asset
  const assetComments = comments.filter(c => 
    c.deliverable_id === deliverable.id &&
    (!c.media_asset_id || c.media_asset_id === currentAsset?.media_asset_id)
  );

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-black/80 to-transparent">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-white font-semibold">{deliverable.title}</h2>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                  {statusConfig.label}
                </span>
                {deliverable.assets && deliverable.assets.length > 1 && (
                  <span>
                    {currentAssetIndex + 1} of {deliverable.assets.length}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {canReview && (
              <>
                <button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={() => setShowChangeDialog(true)}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-4 h-4" />
                  Request Changes
                </button>
              </>
            )}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`p-2 rounded-lg transition-colors ${showComments ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            {currentAsset?.download_url && (
              <a
                href={currentAsset.download_url}
                download
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <Download className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex h-full">
        {/* Viewer */}
        <div className={`flex-1 flex items-center justify-center relative ${showComments ? 'mr-96' : ''}`}>
          {/* Navigation arrows */}
          {deliverable.assets && deliverable.assets.length > 1 && (
            <>
              <button
                onClick={navigatePrev}
                disabled={currentAssetIndex === 0}
                className="absolute left-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={navigateNext}
                disabled={currentAssetIndex === deliverable.assets.length - 1}
                className="absolute right-4 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          
          {/* Video player */}
          {isVideo && currentAsset?.preview_url && (
            <div className="relative w-full h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={currentAsset.preview_url}
                  className="max-w-full max-h-[calc(100vh-120px)]"
                  onClick={togglePlay}
                  muted={isMuted}
                />
              </div>
              
              {/* Video controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4">
                {/* Progress bar */}
                <div 
                  className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3"
                  onClick={handleProgressClick}
                >
                  <div 
                    className="h-full bg-blue-500 rounded-full relative"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full" />
                  </div>
                  
                  {/* Comment markers */}
                  {assetComments.filter(c => c.timecode).map(comment => (
                    <div
                      key={comment.id}
                      className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-400 rounded-full cursor-pointer"
                      style={{ left: `${((comment.timecode || 0) / duration) * 100}%` }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTimecodeClick(comment.timecode!);
                      }}
                      title={comment.body.substring(0, 50)}
                    />
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button onClick={togglePlay} className="text-white">
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                    </button>
                    <button onClick={() => setIsMuted(!isMuted)} className="text-white">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <span className="text-white text-sm">
                      {formatTimecode(currentTime) || '0:00'} / {formatTimecode(duration) || '0:00'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCommentAtTimecode}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Comment at {formatTimecode(currentTime) || '0:00'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Image viewer */}
          {isImage && currentAsset?.preview_url && (
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
              <div
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                <Image
                  src={currentAsset.preview_url}
                  alt={currentAsset.filename}
                  width={currentAsset.width || 1920}
                  height={currentAsset.height || 1080}
                  className="max-w-full max-h-[calc(100vh-100px)] object-contain"
                />
              </div>
              
              {/* Zoom controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 rounded-lg">
                <button
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                  className="p-1 text-white hover:bg-white/10 rounded"
                >
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-sm w-12 text-center">{Math.round(zoom * 100)}%</span>
                <button
                  onClick={() => setZoom(Math.min(4, zoom + 0.25))}
                  className="p-1 text-white hover:bg-white/10 rounded"
                >
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                  className="p-1 text-white hover:bg-white/10 rounded"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
          
          {/* Fallback for other file types */}
          {!isVideo && !isImage && currentAsset && (
            <div className="text-center text-white">
              <div className="text-6xl mb-4">📄</div>
              <p className="text-xl font-medium">{currentAsset.filename}</p>
              {currentAsset.download_url && (
                <a
                  href={currentAsset.download_url}
                  download
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download File
                </a>
              )}
            </div>
          )}
        </div>
        
        {/* Comments sidebar */}
        {showComments && (
          <div className="absolute top-0 right-0 bottom-0 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white">
                Comments ({assetComments.length})
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <CommentsList
                comments={assetComments}
                onResolve={onResolveComment}
                onTimecodeClick={handleTimecodeClick}
              />
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-800">
              <CommentsForm
                onSubmit={handleAddComment}
                timecode={commentTimecode}
                onClearTimecode={() => setCommentTimecode(undefined)}
              />
            </div>
          </div>
        )}
      </div>
      
      {/* Change request dialog */}
      {showChangeDialog && (
        <div 
          className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowChangeDialog(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-xl p-6 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Request Changes
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Please describe the changes you'd like to see for "{deliverable.title}".
            </p>
            <textarea
              value={changeReason}
              onChange={(e) => setChangeReason(e.target.value)}
              placeholder="Describe the changes needed..."
              rows={4}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
            <div className="flex items-center justify-between mt-4">
              <span className={`text-xs ${changeReason.trim().length < 10 ? 'text-slate-400' : 'text-emerald-500'}`}>
                {changeReason.trim().length}/10 characters minimum
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowChangeDialog(false)}
                  className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitChange}
                  disabled={changeReason.trim().length < 10 || isLoading}
                  className="px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
