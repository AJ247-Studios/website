/**
 * Mock Data for Client Portal & Admin Dashboard
 * 
 * Sample data for development and testing
 */

import type {
  ClientProfile,
  Project,
  Deliverable,
  Invoice,
  ActivityItem,
  MessageThread,
  Lead,
  AdminKpis,
  AdminAlert,
  SystemTask,
} from "./types/portal";

// ============================================
// Mock Client Profile
// ============================================

export const mockClientProfile: ClientProfile = {
  id: "client_001",
  user_id: "user_001",
  name: "Anna Kowalska",
  email: "anna.kowalska@example.com",
  phone: "+48 512 345 678",
  avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  company: "Kowalska Events",
  preferences: {
    contact_method: "email",
    locale: "pl-PL",
    timezone: "Europe/Warsaw",
    notification_email: true,
    notification_sms: false,
  },
  billing_address: {
    street: "ul. Floriańska 15",
    city: "Kraków",
    postal_code: "31-019",
    country: "Poland",
  },
  tax_number: "PL1234567890",
  stripe_customer_id: "cus_abc123",
  tags: ["vip", "repeat"],
  created_at: "2024-06-15T10:00:00Z",
  updated_at: "2024-12-01T14:30:00Z",
};

// ============================================
// Mock Projects
// ============================================

export const mockProjects: Project[] = [
  {
    id: "proj_001",
    client_id: "client_001",
    title: "Summer Wedding - Anna & Tomek",
    description: "Full day wedding coverage at Wawel Castle",
    service_type: "wedding",
    status: "review",
    shoot_date: "2024-11-15T10:00:00Z",
    delivery_date: "2024-12-15T10:00:00Z",
    milestones: [
      { id: "m1", name: "Booking Confirmed", status: "completed", completed_at: "2024-08-01T10:00:00Z" },
      { id: "m2", name: "Pre-shoot Consultation", status: "completed", completed_at: "2024-11-01T14:00:00Z" },
      { id: "m3", name: "Photo Shoot", status: "completed", completed_at: "2024-11-15T22:00:00Z" },
      { id: "m4", name: "Editing", status: "completed", completed_at: "2024-12-01T18:00:00Z" },
      { id: "m5", name: "Client Review", status: "in_progress" },
      { id: "m6", name: "Final Delivery", status: "pending", scheduled_at: "2024-12-15T10:00:00Z" },
    ],
    deliverables_count: 245,
    pending_approvals: 3,
    total_value_cents: 650000,
    paid_cents: 325000,
    assigned_to: ["team_001", "team_002"],
    tags: ["wedding", "premium"],
    created_at: "2024-08-01T10:00:00Z",
    updated_at: "2024-12-10T09:00:00Z",
  },
  {
    id: "proj_002",
    client_id: "client_001",
    title: "Corporate Headshots - Kowalska Events",
    description: "Team headshots for company website",
    service_type: "corporate",
    status: "delivered",
    shoot_date: "2024-10-20T09:00:00Z",
    delivery_date: "2024-10-27T10:00:00Z",
    milestones: [
      { id: "m1", name: "Booking Confirmed", status: "completed", completed_at: "2024-10-10T10:00:00Z" },
      { id: "m2", name: "Photo Shoot", status: "completed", completed_at: "2024-10-20T17:00:00Z" },
      { id: "m3", name: "Editing", status: "completed", completed_at: "2024-10-25T18:00:00Z" },
      { id: "m4", name: "Final Delivery", status: "completed", completed_at: "2024-10-27T10:00:00Z" },
    ],
    deliverables_count: 24,
    pending_approvals: 0,
    total_value_cents: 200000,
    paid_cents: 200000,
    assigned_to: ["team_001"],
    tags: ["corporate", "headshots"],
    created_at: "2024-10-10T10:00:00Z",
    updated_at: "2024-10-27T10:00:00Z",
  },
  {
    id: "proj_003",
    client_id: "client_001",
    title: "Product Photography - Spring Collection",
    description: "E-commerce product shots for new collection",
    service_type: "product",
    status: "scheduled",
    shoot_date: "2024-12-20T09:00:00Z",
    delivery_date: "2024-12-30T10:00:00Z",
    milestones: [
      { id: "m1", name: "Booking Confirmed", status: "completed", completed_at: "2024-12-01T10:00:00Z" },
      { id: "m2", name: "Pre-shoot Planning", status: "in_progress" },
      { id: "m3", name: "Photo Shoot", status: "pending", scheduled_at: "2024-12-20T09:00:00Z" },
      { id: "m4", name: "Editing", status: "pending" },
      { id: "m5", name: "Final Delivery", status: "pending", scheduled_at: "2024-12-30T10:00:00Z" },
    ],
    deliverables_count: 0,
    pending_approvals: 0,
    total_value_cents: 350000,
    paid_cents: 175000,
    assigned_to: ["team_001"],
    tags: ["product", "e-commerce"],
    created_at: "2024-12-01T10:00:00Z",
    updated_at: "2024-12-05T14:00:00Z",
  },
];

// ============================================
// Mock Deliverables
// ============================================

export const mockDeliverables: Deliverable[] = [
  {
    id: "del_001",
    project_id: "proj_001",
    title: "Ceremony - First Look",
    description: "First look moment at Wawel Castle courtyard",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 8500000,
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    preview_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&h=1280&fit=crop",
    resolution: { width: 6000, height: 4000 },
    approval_status: "pending",
    annotations: [],
    expiry_at: "2025-01-15T10:00:00Z",
    download_count: 0,
    created_at: "2024-12-05T10:00:00Z",
    updated_at: "2024-12-05T10:00:00Z",
  },
  {
    id: "del_002",
    project_id: "proj_001",
    title: "Ceremony - Vows Exchange",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 9200000,
    thumbnail_url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=400&h=300&fit=crop",
    preview_url: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1920&h=1280&fit=crop",
    resolution: { width: 6000, height: 4000 },
    approval_status: "approved",
    annotations: [],
    expiry_at: "2025-01-15T10:00:00Z",
    download_count: 2,
    last_downloaded_at: "2024-12-08T15:30:00Z",
    created_at: "2024-12-05T10:05:00Z",
    updated_at: "2024-12-07T09:00:00Z",
  },
  {
    id: "del_003",
    project_id: "proj_001",
    title: "Reception - First Dance",
    file_type: "video",
    mime_type: "video/mp4",
    file_size: 450000000,
    thumbnail_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop",
    preview_url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1920&h=1080&fit=crop",
    resolution: { width: 3840, height: 2160 },
    duration: 180,
    approval_status: "revision_requested",
    annotations: [
      {
        id: "ann_001",
        author_id: "client_001",
        author_name: "Anna Kowalska",
        timecode: 45,
        text: "Can we trim the beginning? The DJ announcement is too long.",
        created_at: "2024-12-09T11:00:00Z",
        resolved: false,
      },
    ],
    expiry_at: "2025-01-15T10:00:00Z",
    download_count: 1,
    last_downloaded_at: "2024-12-06T18:00:00Z",
    created_at: "2024-12-05T10:10:00Z",
    updated_at: "2024-12-09T11:00:00Z",
  },
  {
    id: "del_004",
    project_id: "proj_001",
    title: "Portrait - Bride Solo",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 7800000,
    thumbnail_url: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=400&h=300&fit=crop",
    preview_url: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?w=1920&h=1280&fit=crop",
    resolution: { width: 6000, height: 4000 },
    approval_status: "pending",
    annotations: [],
    expiry_at: "2025-01-15T10:00:00Z",
    download_count: 0,
    created_at: "2024-12-05T10:15:00Z",
    updated_at: "2024-12-05T10:15:00Z",
  },
  {
    id: "del_005",
    project_id: "proj_001",
    title: "Group Photo - Family",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 10200000,
    thumbnail_url: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=400&h=300&fit=crop",
    preview_url: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=1920&h=1280&fit=crop",
    resolution: { width: 8000, height: 5333 },
    approval_status: "pending",
    annotations: [],
    expiry_at: "2025-01-15T10:00:00Z",
    download_count: 0,
    created_at: "2024-12-05T10:20:00Z",
    updated_at: "2024-12-05T10:20:00Z",
  },
  {
    id: "del_006",
    project_id: "proj_001",
    title: "Highlights Reel",
    file_type: "video",
    mime_type: "video/mp4",
    file_size: 850000000,
    thumbnail_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    resolution: { width: 3840, height: 2160 },
    duration: 300,
    approval_status: "approved",
    annotations: [],
    expiry_at: "2025-01-15T10:00:00Z",
    download_count: 5,
    last_downloaded_at: "2024-12-10T09:00:00Z",
    created_at: "2024-12-08T14:00:00Z",
    updated_at: "2024-12-09T16:00:00Z",
  },
];

// ============================================
// Mock Invoices
// ============================================

export const mockInvoices: Invoice[] = [
  {
    id: "inv_001",
    invoice_number: "INV-2024-0042",
    client_id: "client_001",
    project_id: "proj_001",
    status: "sent",
    line_items: [
      { id: "li_001", description: "Wedding Photography - Full Day", quantity: 1, unit_price_cents: 450000, total_cents: 450000 },
      { id: "li_002", description: "Wedding Videography - Full Day", quantity: 1, unit_price_cents: 200000, total_cents: 200000 },
    ],
    subtotal_cents: 650000,
    tax_cents: 0,
    total_cents: 650000,
    currency: "PLN",
    due_date: "2024-12-20T00:00:00Z",
    stripe_invoice_id: "in_abc123",
    payment_url: "https://invoice.stripe.com/i/acct_123/test_456",
    created_at: "2024-11-20T10:00:00Z",
    updated_at: "2024-11-20T10:00:00Z",
  },
  {
    id: "inv_002",
    invoice_number: "INV-2024-0035",
    client_id: "client_001",
    project_id: "proj_002",
    status: "paid",
    line_items: [
      { id: "li_003", description: "Corporate Headshots - 12 people", quantity: 1, unit_price_cents: 200000, total_cents: 200000 },
    ],
    subtotal_cents: 200000,
    tax_cents: 0,
    total_cents: 200000,
    currency: "PLN",
    due_date: "2024-10-25T00:00:00Z",
    paid_at: "2024-10-24T14:30:00Z",
    stripe_invoice_id: "in_def456",
    created_at: "2024-10-20T10:00:00Z",
    updated_at: "2024-10-24T14:30:00Z",
  },
  {
    id: "inv_003",
    invoice_number: "INV-2024-0048",
    client_id: "client_001",
    project_id: "proj_003",
    status: "sent",
    line_items: [
      { id: "li_004", description: "Product Photography - 50 items (deposit)", quantity: 1, unit_price_cents: 175000, total_cents: 175000 },
    ],
    subtotal_cents: 175000,
    tax_cents: 0,
    total_cents: 175000,
    currency: "PLN",
    due_date: "2024-12-18T00:00:00Z",
    stripe_invoice_id: "in_ghi789",
    payment_url: "https://invoice.stripe.com/i/acct_123/test_789",
    created_at: "2024-12-05T10:00:00Z",
    updated_at: "2024-12-05T10:00:00Z",
  },
];

// ============================================
// Mock Activity Feed
// ============================================

export const mockActivityFeed: ActivityItem[] = [
  {
    id: "act_001",
    type: "deliverable_uploaded",
    actor_id: "team_001",
    actor_name: "AJ247 Studios",
    target_type: "deliverable",
    target_id: "del_006",
    target_title: "Highlights Reel",
    created_at: "2024-12-08T14:00:00Z",
  },
  {
    id: "act_002",
    type: "deliverable_approved",
    actor_id: "client_001",
    actor_name: "Anna Kowalska",
    actor_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    target_type: "deliverable",
    target_id: "del_002",
    target_title: "Ceremony - Vows Exchange",
    created_at: "2024-12-07T09:00:00Z",
  },
  {
    id: "act_003",
    type: "deliverable_revision_requested",
    actor_id: "client_001",
    actor_name: "Anna Kowalska",
    actor_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
    target_type: "deliverable",
    target_id: "del_003",
    target_title: "Reception - First Dance",
    metadata: { comment: "Can we trim the beginning?" },
    created_at: "2024-12-09T11:00:00Z",
  },
  {
    id: "act_004",
    type: "invoice_sent",
    actor_id: "team_001",
    actor_name: "AJ247 Studios",
    target_type: "invoice",
    target_id: "inv_003",
    target_title: "INV-2024-0048",
    created_at: "2024-12-05T10:00:00Z",
  },
  {
    id: "act_005",
    type: "message_received",
    actor_id: "team_001",
    actor_name: "AJ247 Studios",
    target_type: "message",
    target_id: "msg_001",
    target_title: "Wedding photos ready for review!",
    created_at: "2024-12-05T09:30:00Z",
  },
];

// ============================================
// Mock Messages
// ============================================

export const mockMessageThreads: MessageThread[] = [
  {
    id: "thread_001",
    project_id: "proj_001",
    subject: "Wedding Photos - Review Ready",
    participants: [
      { id: "client_001", name: "Anna Kowalska", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop", type: "client" },
      { id: "team_001", name: "AJ247 Studios", type: "team" },
    ],
    last_message: {
      id: "msg_001",
      thread_id: "thread_001",
      project_id: "proj_001",
      sender_id: "team_001",
      sender_name: "AJ247 Studios",
      sender_type: "team",
      content: "Hi Anna! Your wedding photos are ready for review. We've uploaded 245 edited images - please take your time reviewing them and let us know if you'd like any adjustments. The highlight reel video is also ready!",
      created_at: "2024-12-05T09:30:00Z",
    },
    unread_count: 1,
    created_at: "2024-12-05T09:30:00Z",
    updated_at: "2024-12-05T09:30:00Z",
  },
];

// ============================================
// Mock Leads (Admin)
// ============================================

export const mockLeads: Lead[] = [
  {
    id: "lead_001",
    name: "Michał Nowak",
    email: "michal.nowak@company.pl",
    phone: "+48 600 123 456",
    company: "TechStart Sp. z o.o.",
    requested_service: "corporate",
    event_date: "2025-01-15T09:00:00Z",
    message: "Looking for professional headshots for our team of 25 people. We need them for our new website launch.",
    estimated_value_cents: 350000,
    status: "new",
    source: "website",
    created_at: "2024-12-12T08:30:00Z",
    updated_at: "2024-12-12T08:30:00Z",
  },
  {
    id: "lead_002",
    name: "Katarzyna Wiśniewska",
    email: "kasia.w@gmail.com",
    phone: "+48 512 987 654",
    requested_service: "wedding",
    event_date: "2025-06-21T14:00:00Z",
    message: "Planning our wedding at Sukiennice. Looking for both photo and video coverage.",
    estimated_value_cents: 800000,
    status: "contacted",
    source: "referral",
    assigned_to: "team_001",
    notes: "Referred by Anna Kowalska. Premium budget.",
    created_at: "2024-12-10T14:00:00Z",
    updated_at: "2024-12-11T10:00:00Z",
  },
  {
    id: "lead_003",
    name: "Paweł Zieliński",
    email: "pawel@sportclub.pl",
    phone: "+48 501 222 333",
    company: "Wisła Kraków",
    requested_service: "sports",
    message: "Need event coverage for upcoming tournament. 3 days, multiple courts.",
    estimated_value_cents: 450000,
    status: "qualified",
    source: "google",
    assigned_to: "team_002",
    created_at: "2024-12-08T16:00:00Z",
    updated_at: "2024-12-09T09:00:00Z",
  },
];

// ============================================
// Mock Admin KPIs
// ============================================

export const mockAdminKpis: AdminKpis = {
  revenue_this_month_cents: 1850000,
  revenue_change_percent: 12.5,
  bookings_this_week: 4,
  bookings_change_percent: -20,
  open_projects: 8,
  pending_approvals: 12,
  unpaid_invoices_cents: 825000,
  overdue_invoices_count: 1,
  unread_messages: 3,
  avg_turnaround_days: 7.2,
};

// ============================================
// Mock Admin Alerts
// ============================================

export const mockAdminAlerts: AdminAlert[] = [
  {
    id: "alert_001",
    type: "lead",
    priority: "high",
    title: "New Lead: Michał Nowak",
    description: "Corporate headshots inquiry - TechStart Sp. z o.o.",
    action_label: "View Lead",
    action_url: "/admin/leads/lead_001",
    target_id: "lead_001",
    created_at: "2024-12-12T08:30:00Z",
  },
  {
    id: "alert_002",
    type: "approval",
    priority: "medium",
    title: "Revision Requested",
    description: "Anna Kowalska requested changes to 'Reception - First Dance'",
    action_label: "View",
    action_url: "/admin/projects/proj_001/deliverables/del_003",
    target_id: "del_003",
    created_at: "2024-12-09T11:00:00Z",
  },
  {
    id: "alert_003",
    type: "overdue",
    priority: "urgent",
    title: "Invoice Overdue",
    description: "INV-2024-0039 from Kowalski Photography is 5 days overdue",
    action_label: "Send Reminder",
    action_url: "/admin/invoices/inv_039",
    target_id: "inv_039",
    created_at: "2024-12-07T00:00:00Z",
  },
  {
    id: "alert_004",
    type: "message",
    priority: "medium",
    title: "Unread Message",
    description: "New message from Katarzyna Wiśniewska about wedding booking",
    action_label: "Reply",
    action_url: "/admin/messages/thread_002",
    target_id: "thread_002",
    created_at: "2024-12-11T15:30:00Z",
  },
];

// ============================================
// Mock System Tasks
// ============================================

export const mockSystemTasks: SystemTask[] = [
  {
    id: "task_001",
    type: "transcode",
    status: "running",
    progress: 67,
    title: "Transcoding: Wedding Highlights 4K",
    details: "Converting to web-optimized format",
    started_at: "2024-12-12T09:00:00Z",
  },
  {
    id: "task_002",
    type: "backup",
    status: "completed",
    title: "Daily Backup",
    details: "All project files backed up to R2",
    started_at: "2024-12-12T03:00:00Z",
    completed_at: "2024-12-12T03:45:00Z",
  },
  {
    id: "task_003",
    type: "export",
    status: "pending",
    title: "Export: Corporate Headshots ZIP",
    details: "Preparing download package for client",
  },
];

// ============================================
// Helper Functions
// ============================================

export function getClientPortalData(clientId: string) {
  const client = mockClientProfile;
  const projects = mockProjects.filter(p => p.client_id === clientId);
  const pendingInvoices = mockInvoices.filter(i => i.client_id === clientId && i.status !== "paid");
  const totalOwed = pendingInvoices.reduce((sum, inv) => sum + inv.total_cents, 0);
  const nextShoot = projects.find(p => p.status === "scheduled")?.shoot_date;

  return {
    client,
    projects,
    recentDeliverables: mockDeliverables.slice(0, 6),
    pendingInvoices,
    recentActivity: mockActivityFeed,
    unreadMessages: mockMessageThreads.reduce((sum, t) => sum + t.unread_count, 0),
    nextShootDate: nextShoot,
    totalOwed,
  };
}

export function getAdminDashboardData() {
  return {
    kpis: mockAdminKpis,
    alerts: mockAdminAlerts,
    recentProjects: mockProjects,
    systemTasks: mockSystemTasks,
  };
}

export function formatCurrency(cents: number, currency = "PLN"): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function getStatusColor(status: string): { bg: string; text: string; dot: string } {
  const colors: Record<string, { bg: string; text: string; dot: string }> = {
    // Project statuses
    inquiry: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
    quoted: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
    confirmed: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
    scheduled: { bg: "bg-cyan-100 dark:bg-cyan-900/30", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500" },
    in_progress: { bg: "bg-amber-100 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
    editing: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
    review: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", dot: "bg-yellow-500" },
    delivered: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
    completed: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
    cancelled: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
    
    // Approval statuses
    pending: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", dot: "bg-yellow-500" },
    approved: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
    revision_requested: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
    
    // Invoice statuses
    draft: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
    sent: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
    viewed: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
    paid: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
    overdue: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
    refunded: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },

    // Lead statuses  
    new: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
    contacted: { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
    qualified: { bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
    won: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300", dot: "bg-green-500" },
    lost: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },

    // Alert priorities
    low: { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-700 dark:text-slate-300", dot: "bg-slate-400" },
    medium: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300", dot: "bg-yellow-500" },
    high: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300", dot: "bg-orange-500" },
    urgent: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300", dot: "bg-red-500" },
  };

  return colors[status] || colors.pending;
}
