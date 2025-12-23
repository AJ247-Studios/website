/**
 * Project Components Index
 * 
 * Central export for all project-related components
 */

// Main page component
export { ProjectPage } from "./ProjectPage";
export type { ProjectPageProps, ProjectMember } from "./ProjectPage";

// Layout components
export { ProjectHeader } from "./ProjectHeader";
export type { ProjectHeaderProps } from "./ProjectHeader";

export { ProjectTabs } from "./ProjectTabs";
export type { ProjectTabsProps, TabId } from "./ProjectTabs";

// Tab content components
export { ProjectOverview } from "./ProjectOverview";
export type { ProjectOverviewProps } from "./ProjectOverview";

export { FileGallery } from "./FileGallery";
export type { FileGalleryProps } from "./FileGallery";

export { ProjectTimeline } from "./ProjectTimeline";
export type { ProjectTimelineProps } from "./ProjectTimeline";

export { ProjectMembers } from "./ProjectMembers";
export type { ProjectMembersProps } from "./ProjectMembers";

// Studio-grade gallery components
export { StudioFileGallery } from "./StudioFileGallery";
export type { StudioFileGalleryProps } from "./StudioFileGallery";

export { FilterPanel } from "./FilterPanel";
export type { FilterPanelProps, FilterState, FilterCounts, SortOption } from "./FilterPanel";

export { MediaGrid } from "./MediaGrid";
export type { MediaGridProps, ViewMode, ThumbnailSize } from "./MediaGrid";

export { AssetDetailDrawer } from "./AssetDetailDrawer";
export type { AssetDetailDrawerProps } from "./AssetDetailDrawer";

// Modal components
export { UploadModal } from "./UploadModal";
export type { UploadModalProps } from "./UploadModal";

export { DeliveryModal } from "./DeliveryModal";
export type { DeliveryModalProps } from "./DeliveryModal";

export { CreateProjectModal } from "./CreateProjectModal";
export type { CreateProjectModalProps } from "./CreateProjectModal";
