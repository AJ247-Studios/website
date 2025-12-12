/**
 * Client Portal & Admin Dashboard Types
 * 
 * Data models for:
 * - Client profiles with preferences
 * - Deliverables with approval status
 * - Projects with timeline milestones
 * - Invoices and payments
 * - Activity feeds and audit logs
 * - Leads and quotes
 */

// ============================================
// Client Profile (extends User)
// ============================================

export interface ClientPreferences {
  contact_method: "email" | "phone" | "whatsapp";
  locale: string;
  timezone: string;
  notification_email: boolean;
  notification_sms: boolean;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  company?: string;
  preferences: ClientPreferences;
  billing_address?: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  tax_number?: string;
  stripe_customer_id?: string;
  tags: ClientTag[];
  created_at: string;
  updated_at: string;
}

export type ClientTag = "vip" | "repeat" | "partner" | "new" | "inactive";

// ============================================
// Deliverables & Assets
// ============================================

export type ApprovalStatus = "pending" | "approved" | "revision_requested" | "delivered";

export interface Annotation {
  id: string;
  author_id: string;
  author_name: string;
  x?: number; // percentage for images
  y?: number;
  timecode?: number; // seconds for video
  text: string;
  created_at: string;
  resolved: boolean;
}

export interface Deliverable {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  file_type: "image" | "video" | "document" | "archive";
  mime_type: string;
  file_size: number; // bytes
  thumbnail_url: string;
  preview_url?: string; // full-res preview
  download_url_signed?: string;
  resolution?: { width: number; height: number };
  duration?: number; // seconds for video
  approval_status: ApprovalStatus;
  annotations: Annotation[];
  expiry_at?: string;
  download_count: number;
  last_downloaded_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeliverableGroup {
  id: string;
  project_id: string;
  name: string;
  deliverables: Deliverable[];
  created_at: string;
}

// ============================================
// Projects & Timeline
// ============================================

export type ProjectStatus = 
  | "inquiry" 
  | "quoted" 
  | "confirmed" 
  | "scheduled" 
  | "in_progress" 
  | "editing" 
  | "review" 
  | "delivered" 
  | "completed" 
  | "cancelled";

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "in_progress" | "completed" | "skipped";
  scheduled_at?: string;
  completed_at?: string;
}

export interface Project {
  id: string;
  client_id: string;
  title: string;
  description?: string;
  service_type: string;
  status: ProjectStatus;
  shoot_date?: string;
  delivery_date?: string;
  milestones: ProjectMilestone[];
  deliverables_count: number;
  pending_approvals: number;
  total_value_cents: number;
  paid_cents: number;
  assigned_to?: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
}

// ============================================
// Invoices & Payments
// ============================================

export type InvoiceStatus = "draft" | "sent" | "viewed" | "paid" | "overdue" | "cancelled" | "refunded";

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price_cents: number;
  total_cents: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string;
  project_id?: string;
  status: InvoiceStatus;
  line_items: InvoiceLineItem[];
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  due_date: string;
  paid_at?: string;
  stripe_invoice_id?: string;
  stripe_payment_intent_id?: string;
  payment_url?: string;
  pdf_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Messages & Activity
// ============================================

export type ActivityType = 
  | "deliverable_uploaded"
  | "deliverable_approved"
  | "deliverable_revision_requested"
  | "deliverable_downloaded"
  | "comment_added"
  | "invoice_sent"
  | "invoice_paid"
  | "project_status_changed"
  | "file_uploaded"
  | "message_received"
  | "message_sent";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  target_type: "project" | "deliverable" | "invoice" | "message";
  target_id: string;
  target_title: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface Message {
  id: string;
  thread_id: string;
  project_id?: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  sender_type: "client" | "team";
  content: string;
  attachments?: {
    name: string;
    url: string;
    size: number;
    type: string;
  }[];
  read_at?: string;
  created_at: string;
}

export interface MessageThread {
  id: string;
  project_id?: string;
  subject: string;
  participants: {
    id: string;
    name: string;
    avatar?: string;
    type: "client" | "team";
  }[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

// ============================================
// Leads & Quotes
// ============================================

export type LeadStatus = "new" | "contacted" | "qualified" | "quoted" | "won" | "lost";

export interface Lead {
  id: string;
  client_id?: string; // null if not converted to client
  name: string;
  email: string;
  phone?: string;
  company?: string;
  requested_service: string;
  event_date?: string;
  message?: string;
  estimated_value_cents?: number;
  status: LeadStatus;
  source: string;
  assigned_to?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  lead_id?: string;
  client_id?: string;
  title: string;
  description?: string;
  line_items: InvoiceLineItem[];
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  currency: string;
  valid_until: string;
  status: "draft" | "sent" | "viewed" | "accepted" | "declined" | "expired";
  accepted_at?: string;
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}

// ============================================
// Admin Audit Logs
// ============================================

export interface AuditLogEntry {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action: string;
  resource_type: string;
  resource_id: string;
  previous_value?: Record<string, unknown>;
  new_value?: Record<string, unknown>;
  reason?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// ============================================
// Admin Dashboard Types
// ============================================

export interface AdminKpis {
  revenue_this_month_cents: number;
  revenue_change_percent: number;
  bookings_this_week: number;
  bookings_change_percent: number;
  open_projects: number;
  pending_approvals: number;
  unpaid_invoices_cents: number;
  overdue_invoices_count: number;
  unread_messages: number;
  avg_turnaround_days: number;
}

export interface AdminAlert {
  id: string;
  type: "lead" | "message" | "overdue" | "approval" | "payment" | "system";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  action_label?: string;
  action_url?: string;
  target_id?: string;
  created_at: string;
  read_at?: string;
}

export interface SystemTask {
  id: string;
  type: "transcode" | "export" | "backup" | "sync";
  status: "pending" | "running" | "completed" | "failed";
  progress?: number;
  title: string;
  details?: string;
  started_at?: string;
  completed_at?: string;
  error?: string;
}

// ============================================
// Client Uploads
// ============================================

export interface ClientUpload {
  id: string;
  project_id: string;
  client_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  url: string;
  description?: string;
  upload_progress?: number;
  status: "uploading" | "processing" | "ready" | "failed";
  created_at: string;
}

// ============================================
// API Response Types
// ============================================

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface ApiError {
  error: string;
  details?: string[];
  code?: string;
}

// ============================================
// Component Props Types
// ============================================

export interface ClientPortalData {
  client: ClientProfile;
  projects: Project[];
  recentDeliverables: Deliverable[];
  pendingInvoices: Invoice[];
  recentActivity: ActivityItem[];
  unreadMessages: number;
  nextShootDate?: string;
  totalOwed: number;
}

export interface AdminDashboardData {
  kpis: AdminKpis;
  alerts: AdminAlert[];
  recentProjects: Project[];
  systemTasks: SystemTask[];
}
