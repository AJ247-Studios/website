/**
 * Enhanced Profile Page
 * 
 * UX Blueprint Implementation:
 * - Visual identity up top (ProfileHero)
 * - Recent deliverables front-and-center (DeliverablesStrip)
 * - Single-click actions (Approve, Download, Book)
 * - Clear billing & contact (BillingWidget)
 * - Frictionless editing (PreferencesPanel)
 * - Security controls (SecurityPanel)
 * - Mobile quick-action bar (QuickActionBar)
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import {
  ProfileHero,
  QuickActionBar,
  DeliverablesStrip,
  DeliverablePreviewModal,
  BillingWidget,
  PreferencesPanel,
  SecurityPanel,
  ShareLinkModal,
} from "@/components/profile";
import type { ShareLinkOptions } from "@/components/profile/ShareLinkModal";
import type { ClientProfile, Deliverable, Invoice, Annotation } from "@/lib/types/portal";

// ============================================================================
// MOCK DATA (replace with Supabase queries)
// ============================================================================

const mockDeliverables: Deliverable[] = [
  {
    id: "d1",
    project_id: "proj-1",
    thumbnail_url: "https://images.unsplash.com/photo-1606761568499-6d2451b23c66?w=400&h=300&fit=crop",
    title: "Wedding Ceremony Highlights",
    file_type: "video",
    mime_type: "video/mp4",
    file_size: 2400000000,
    resolution: { width: 3840, height: 2160 },
    approval_status: "approved",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    download_count: 3,
    annotations: [
      { 
        id: "a1", 
        author_id: "user1", 
        author_name: "Klient", 
        text: "Beautiful shot!", 
        created_at: new Date().toISOString(),
        resolved: false,
        x: 45,
        y: 30
      },
    ],
  },
  {
    id: "d2",
    project_id: "proj-1",
    thumbnail_url: "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=400&h=300&fit=crop",
    title: "Reception Photos Set 1",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 850000000,
    resolution: { width: 6000, height: 4000 },
    approval_status: "pending",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    download_count: 0,
    annotations: [],
  },
  {
    id: "d3",
    project_id: "proj-1",
    thumbnail_url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop",
    title: "Portrait Session",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 1200000000,
    resolution: { width: 8000, height: 5333 },
    approval_status: "revision_requested",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    download_count: 1,
    annotations: [
      { 
        id: "a2", 
        author_id: "user2", 
        author_name: "You", 
        text: "Can we adjust the color grading here?", 
        created_at: new Date().toISOString(),
        resolved: false,
        x: 50,
        y: 50
      },
    ],
  },
  {
    id: "d4",
    project_id: "proj-1",
    thumbnail_url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=300&fit=crop",
    title: "Drone Footage",
    file_type: "video",
    mime_type: "video/mp4",
    file_size: 3800000000,
    resolution: { width: 3840, height: 2160 },
    approval_status: "approved",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    download_count: 2,
    expiry_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    annotations: [],
  },
  {
    id: "d5",
    project_id: "proj-1",
    thumbnail_url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=400&h=300&fit=crop",
    title: "First Dance Edit",
    file_type: "video",
    mime_type: "video/mp4",
    file_size: 1100000000,
    resolution: { width: 3840, height: 2160 },
    approval_status: "pending",
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    download_count: 0,
    annotations: [],
  },
  {
    id: "d6",
    project_id: "proj-1",
    thumbnail_url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=300&fit=crop",
    title: "Guest Candids",
    file_type: "image",
    mime_type: "image/jpeg",
    file_size: 620000000,
    resolution: { width: 1920, height: 1080 },
    approval_status: "approved",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    download_count: 5,
    annotations: [],
  },
];

const mockInvoices: Invoice[] = [
  {
    id: "inv-001",
    invoice_number: "INV-2024-001",
    client_id: "client-1",
    project_id: "proj-1",
    subtotal_cents: 450000,
    tax_cents: 0,
    total_cents: 450000,
    currency: "PLN",
    status: "paid",
    due_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    paid_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    line_items: [{ id: "li-1", description: "Kowalski Wedding", quantity: 1, unit_price_cents: 450000, total_cents: 450000 }],
    stripe_payment_intent_id: "pi_123",
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv-002",
    invoice_number: "INV-2024-002",
    client_id: "client-1",
    project_id: "proj-1",
    subtotal_cents: 200000,
    tax_cents: 0,
    total_cents: 200000,
    currency: "PLN",
    status: "sent",
    due_date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000).toISOString(),
    line_items: [{ id: "li-2", description: "Post-Production Package", quantity: 1, unit_price_cents: 200000, total_cents: 200000 }],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "inv-003",
    invoice_number: "INV-2024-003",
    client_id: "client-1",
    project_id: "proj-1",
    subtotal_cents: 80000,
    tax_cents: 0,
    total_cents: 80000,
    currency: "PLN",
    status: "overdue",
    due_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    line_items: [{ id: "li-3", description: "Rush Delivery Fee", quantity: 1, unit_price_cents: 80000, total_cents: 80000 }],
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfilePage() {
  const { supabase, session, role: userRole } = useSupabase();
  const router = useRouter();

  // Core states
  const [loading, setLoading] = useState(true);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Profile data
  const [profileData, setProfileData] = useState<ClientProfile | null>(null);

  // Deliverables
  const [deliverables] = useState<Deliverable[]>(mockDeliverables);
  const [previewDeliverable, setPreviewDeliverable] = useState<Deliverable | null>(null);

  // Billing
  const [invoices] = useState<Invoice[]>(mockInvoices);

  // Modals
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTarget, setShareTarget] = useState<{ type: "deliverable" | "project"; id: string; name: string } | null>(null);

  // Active section for mobile nav
  const [activeSection, setActiveSection] = useState<"deliverables" | "billing" | "settings" | "security">("deliverables");

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setShowSessionExpired(true), 2000);
      return () => clearTimeout(timer);
    } else {
      setShowSessionExpired(false);
    }
  }, [loading]);

  const handleClearSession = () => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const cookieName = cookie.split("=")[0].trim();
      if (cookieName.startsWith("sb-")) {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      }
    }
    window.location.href = "/login";
  };

  useEffect(() => {
    if (session === null) {
      const timer = setTimeout(() => router.push("/login"), 100);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  // ============================================================================
  // LOAD PROFILE
  // ============================================================================

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("role, display_name, avatar_url, company, phone")
        .eq("id", session.user.id)
        .maybeSingle();

      // Build ClientProfile from fetched data
      const clientProfile: ClientProfile = {
        id: session.user.id,
        user_id: session.user.id,
        name: prof?.display_name || session.user.email?.split("@")[0] || "User",
        email: session.user.email || "",
        phone: prof?.phone,
        avatar_url: prof?.avatar_url,
        company: prof?.company,
        preferences: {
          contact_method: "email",
          locale: "pl-PL",
          timezone: "Europe/Warsaw",
          notification_email: true,
          notification_sms: false,
        },
        tags: [],
        created_at: session.user.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      setProfileData(clientProfile);
      setLoading(false);
    };

    loadProfile();
  }, [session, supabase, userRole]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handlePreviewDeliverable = (deliverable: Deliverable) => {
    setPreviewDeliverable(deliverable);
    // Analytics: onPreviewOpen
  };

  const handleApproveDeliverable = (id: string) => {
    console.log("Approving deliverable:", id);
    // TODO: API call to approve
    // Analytics: onApprove
  };

  const handleRequestRevision = (id: string, comment: string) => {
    console.log("Requesting revision for:", id, "Comment:", comment);
    // TODO: API call to request revision
  };

  const handleDownloadDeliverable = (id: string) => {
    console.log("Downloading deliverable:", id);
    // TODO: Generate signed URL and trigger download
    // Analytics: onDownload
  };

  const handleNavigateDeliverable = (id: string) => {
    const found = deliverables.find((d) => d.id === id);
    if (found) setPreviewDeliverable(found);
  };

  const handleShareDeliverable = (id: string, name: string) => {
    setShareTarget({ type: "deliverable", id, name });
    setShowShareModal(true);
  };

  const handlePayInvoice = (id: string) => {
    console.log("Paying invoice:", id);
    // TODO: Redirect to Stripe checkout
    // Analytics: onPayInvoice
  };

  const handleViewReceipt = (id: string) => {
    console.log("Viewing receipt for invoice:", id);
    // TODO: Generate PDF receipt
  };

  const handleSavePreferences = async (updates: Partial<ClientProfile>) => {
    console.log("Saving preferences:", updates);
    // TODO: API call to save preferences
  };

  const handleExportData = () => {
    console.log("Exporting user data (GDPR)");
    // TODO: Generate GDPR export
  };

  const handleDeleteAccount = () => {
    console.log("Deleting account (GDPR)");
    // TODO: Account deletion flow
  };

  const handleEnable2FA = async (enabled: boolean) => {
    console.log("Toggling 2FA:", enabled);
    // TODO: 2FA setup flow
  };

  const handleTerminateSession = async (sessionId: string) => {
    console.log("Terminating session:", sessionId);
    // TODO: API call to terminate session
  };

  const handleSignOutEverywhere = async () => {
    console.log("Signing out everywhere");
    // TODO: Terminate all sessions
    await handleLogout();
  };

  const handleCreateShareLink = async (options: ShareLinkOptions): Promise<{ url: string }> => {
    console.log("Creating share link:", options);
    // TODO: API call to create share link
    return { url: `https://aj247.studio/share/${Date.now()}` };
  };

  // Quick action bar handlers
  const handleQuickBook = () => {
    router.push("/#contact");
  };

  const handleQuickMessage = () => {
    window.open("https://wa.me/48123456789", "_blank");
  };

  const handleQuickPay = () => {
    setActiveSection("billing");
    window.scrollTo({ top: document.getElementById("billing")?.offsetTop || 0, behavior: "smooth" });
  };

  const handleQuickDownloadAll = () => {
    console.log("Downloading all approved deliverables");
    // TODO: Batch download
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
          {showSessionExpired && (
            <div className="mt-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Taking too long? Your session may have expired.
              </p>
              <button
                onClick={handleClearSession}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline text-sm font-medium"
              >
                Click here to re-login
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!session || !profileData) {
    return null;
  }

  // Compute derived values
  const pendingDeliverables = deliverables.filter((d) => d.approval_status === "pending").length;
  const approvedDeliverables = deliverables.filter((d) => d.approval_status === "approved").length;
  const hasUnpaidInvoices = invoices.some((inv) => inv.status !== "paid");

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 lg:pb-8">
      {/* Profile Hero */}
      <ProfileHero
        profile={profileData}
        isOwnProfile={true}
        onMessage={() => handleQuickMessage()}
        onEditProfile={() => setActiveSection("settings")}
      />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Section Navigation (Mobile) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 lg:hidden scrollbar-hide">
          {(["deliverables", "billing", "settings", "security"] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
              {section === "deliverables" && pendingDeliverables > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs">
                  {pendingDeliverables}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Desktop: Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Deliverables (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Deliverables Strip */}
            <section
              id="deliverables"
              className={`${activeSection !== "deliverables" ? "hidden lg:block" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Recent Deliverables
                </h2>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    {approvedDeliverables} approved
                  </span>
                  {pendingDeliverables > 0 && (
                    <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded">
                      {pendingDeliverables} pending review
                    </span>
                  )}
                </div>
              </div>

              <DeliverablesStrip
                items={deliverables}
                onPreview={(id) => {
                  const found = deliverables.find((d) => d.id === id);
                  if (found) handlePreviewDeliverable(found);
                }}
                onApprove={handleApproveDeliverable}
                onDownload={handleDownloadDeliverable}
              />
            </section>

            {/* Preferences Panel */}
            <section
              id="settings"
              className={`${activeSection !== "settings" ? "hidden lg:block" : ""}`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Preferences
              </h2>
              <PreferencesPanel
                profile={profileData}
                onSave={handleSavePreferences}
                onExportData={handleExportData}
                onDeleteAccount={handleDeleteAccount}
              />
            </section>
          </div>

          {/* Right Column: Billing & Security (1/3 width) */}
          <div className="space-y-8">
            {/* Billing Widget */}
            <section
              id="billing"
              className={`${activeSection !== "billing" ? "hidden lg:block" : ""}`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Billing
              </h2>
              <BillingWidget
                invoices={invoices}
                onPay={handlePayInvoice}
                onViewReceipt={handleViewReceipt}
              />
            </section>

            {/* Security Panel */}
            <section
              id="security"
              className={`${activeSection !== "security" ? "hidden lg:block" : ""}`}
            >
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                Security
              </h2>
              <SecurityPanel
                twoFactorEnabled={false}
                sessions={[
                  {
                    id: "current",
                    device: "Windows",
                    browser: "Chrome",
                    location: "Kraków, Poland",
                    ip_address: "192.168.1.1",
                    last_active: new Date().toISOString(),
                    is_current: true,
                  },
                  {
                    id: "mobile",
                    device: "iPhone",
                    browser: "Safari",
                    location: "Kraków, Poland",
                    ip_address: "192.168.1.2",
                    last_active: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                    is_current: false,
                  },
                ]}
                onToggle2FA={handleEnable2FA}
                onSignOutSession={handleTerminateSession}
                onSignOutAll={handleSignOutEverywhere}
              />
            </section>
          </div>
        </div>
      </div>

      {/* Mobile Quick Action Bar */}
      <QuickActionBar
        hasUnpaidInvoices={hasUnpaidInvoices}
        pendingDownloads={approvedDeliverables}
        onBook={handleQuickBook}
        onMessage={handleQuickMessage}
        onPay={handleQuickPay}
        onDownloadAll={handleQuickDownloadAll}
      />

      {/* Deliverable Preview Modal */}
      {previewDeliverable && (
        <DeliverablePreviewModal
          media={previewDeliverable}
          annotations={previewDeliverable.annotations}
          allItems={deliverables}
          onClose={() => setPreviewDeliverable(null)}
          onApprove={handleApproveDeliverable}
          onRequestRevision={handleRequestRevision}
          onDownload={handleDownloadDeliverable}
          onNavigate={handleNavigateDeliverable}
        />
      )}

      {/* Share Link Modal */}
      {showShareModal && shareTarget && (
        <ShareLinkModal
          isOpen={showShareModal}
          itemTitle={shareTarget.name}
          onClose={() => {
            setShowShareModal(false);
            setShareTarget(null);
          }}
          onCreateLink={handleCreateShareLink}
        />
      )}
    </div>
  );
}
