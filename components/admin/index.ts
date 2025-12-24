/**
 * Admin Dashboard Components
 * Barrel export for clean imports
 */

export { KpiRow } from "./KpiRow";
export { AlertsFeed } from "./AlertsFeed";
export { ProjectsTable } from "./ProjectsTable";
export { QuickClientView } from "./QuickClientView";
export { SystemTasks } from "./SystemTasks";
export { default as FileBrowser } from "./FileBrowser";

// Upload & Media Management Components
export { default as DragDropZone } from "./DragDropZone";
export { FileList, FileRow } from "./FileList";
export type { MediaAsset } from "./FileList";
export { default as BatchMetadataEditor } from "./BatchMetadataEditor";
export type { BatchUpdate } from "./BatchMetadataEditor";
export { default as PublishModal } from "./PublishModal";
export type { PublishConfig, SelectedAsset } from "./PublishModal";
export { default as ProcessingPanel } from "./ProcessingPanel";
export type { ProcessingJob } from "./ProcessingPanel";

// Visual Editor Components (Hero & Portfolio)
export { default as FocalPointPicker } from "./FocalPointPicker";
export { default as ImageEditorPanel } from "./ImageEditorPanel";
export { default as ResponsivePreview } from "./ResponsivePreview";
export { default as VisualPageEditor } from "./VisualPageEditor";
export { default as MediaLibrary } from "./MediaLibrary";
