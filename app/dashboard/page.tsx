"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSupabase } from "@/components/SupabaseProvider";

type DashboardTab = "overview" | "bookings" | "messages" | "portfolio";

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  event_date: string;
  event_location: string;
  service_type: string;
  package_name: string;
  total_price_pln: number;
  deposit_paid: boolean;
  status: "pending" | "deposit_paid" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_name: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  booking_id?: string;
}

const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-001", client_name: "Anna Kowalska", client_email: "anna@example.com",
    event_date: "2025-06-15", event_location: "Kraków", service_type: "wedding",
    package_name: "Premium", total_price_pln: 5599, deposit_paid: true,
    status: "confirmed", notes: "Outdoor ceremony at Planty Park", created_at: "2025-05-01T10:00:00Z",
  },
  {
    id: "bk-002", client_name: "Michał Nowak", client_email: "michal@example.com",
    event_date: "2025-06-22", event_location: "Wrocław", service_type: "sports",
    package_name: "Customized", total_price_pln: 1499, deposit_paid: false,
    status: "pending", notes: "Basketball tournament coverage", created_at: "2025-05-05T14:30:00Z",
  },
  {
    id: "bk-003", client_name: "Katarzyna Wiśniewska", client_email: "kasia@example.com",
    event_date: "2025-07-01", event_location: "Kraków", service_type: "portrait",
    package_name: "Premium", total_price_pln: 949, deposit_paid: true,
    status: "in_progress", notes: "Professional headshots for LinkedIn", created_at: "2025-05-08T09:15:00Z",
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-001", sender_name: "Anna Kowalska", sender_id: "client-001",
    content: "Hi! Just confirming the venue address for our wedding shoot.",
    is_read: false, created_at: "2025-05-10T08:00:00Z", booking_id: "bk-001",
  },
  {
    id: "msg-002", sender_name: "Michał Nowak", sender_id: "client-002",
    content: "Can we add an extra hour to the sports coverage?",
    is_read: true, created_at: "2025-05-09T16:45:00Z", booking_id: "bk-002",
  },
  {
    id: "msg-003", sender_name: "Katarzyna Wiśniewska", sender_id: "client-003",
    content: "Thank you for the quick response! I'll send the outfit options tomorrow.",
    is_read: true, created_at: "2025-05-08T11:20:00Z", booking_id: "bk-003",
  },
];

function StatusBadge({ status }: { status: Booking["status"] }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    deposit_paid: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    in_progress: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    completed: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };
  const labels: Record<string, string> = {
    pending: "Pending", deposit_paid: "Deposit Paid", confirmed: "Confirmed",
    in_progress: "In Progress", completed: "Completed", cancelled: "Cancelled",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Service icon helper
function ServiceIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    wedding: "💍", sports: "🏆", concert: "🎵", portrait: "📸", corporate: "🏢",
  };
  return <span>{icons[type] || "📷"}</span>;
}

export default function EmployeeDashboard() {
  const router = useRouter();
  const { supabase, session, isLoading } = useSupabase();

  // ALL HOOKS must be before any conditional returns
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedMessageClient, setSelectedMessageClient] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Fetch real data
  useEffect(() => {
    if (!session || !supabase) return;

    async function fetchData() {
      try {
        setDataLoading(true);
        setFetchError("");

        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("*")
          .order("created_at", { ascending: false });

        if (bookingsError) {
          console.error("Bookings fetch error:", bookingsError);
          setBookings(MOCK_BOOKINGS);
        } else {
          setBookings((bookingsData || []) as Booking[]);
        }

        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Messages fetch error:", messagesError);
          setMessages(MOCK_MESSAGES);
        } else {
          setMessages((messagesData || []).map((m: any) => ({
            id: m.id, sender_id: m.sender_id, sender_name: m.sender_name || "Client",
            content: m.content, is_read: m.is_read, created_at: m.created_at, booking_id: m.booking_id,
          })) as Message[]);
        }
      } catch (err: any) {
        console.error("Dashboard data fetch error:", err);
        setFetchError("Failed to load data. Showing demo data.");
        setBookings(MOCK_BOOKINGS);
        setMessages(MOCK_MESSAGES);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [session, supabase]);

  // ALL useCallback hooks must be before any conditional returns
  const handleSendReply = useCallback(() => {
    if (!replyText.trim() || !selectedMessageClient) return;
    setReplyText("");
  }, [replyText, selectedMessageClient]);

  const handleUpdateBookingStatus = useCallback((bookingId: string, newStatus: Booking["status"]) => {
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)));
  }, []);

  const handleOpenClientView = useCallback((clientId: string) => {
    console.log("Open client view:", clientId);
  }, []);

  const handleViewProject = useCallback((projectId: string) => {
    console.log("View project:", projectId);
  }, []);

  // NOW we can do conditional returns
  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") {
      router.push("/login?redirect=/dashboard");
    }
    return null;
  }

  // Computed values
  const unreadCount = messages.filter((m) => !m.is_read).length;
  const upcomingBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "in_progress").length;
  const pendingDeposits = bookings.filter((b) => b.status === "pending").length;
  const totalRevenue = bookings.reduce((sum, b) => sum + (b.deposit_paid ? b.total_price_pln : 0), 0);

  // KPIs
  const kpis = [
    { label: "Upcoming Bookings", value: upcomingBookings.toString() },
    { label: "Pending Deposits", value: pendingDeposits.toString() },
    { label: "Unread Messages", value: unreadCount.toString() },
    { label: "Revenue (Paid)", value: `${totalRevenue.toLocaleString()} PLN` },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <Image src="/logo.png" alt="AJ247 Studios" width={28} height={28} className="w-7 h-7 object-contain" />
              </Link>
              <h1 className="font-semibold text-slate-900 dark:text-white">Team Dashboard</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">{session.user?.email}</span>
              <Link href="/portal" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">Client View</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error banner */}
        {fetchError && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
            {fetchError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
          {([
            { key: "overview" as DashboardTab, label: "Overview" },
            { key: "bookings" as DashboardTab, label: "Bookings" },
            { key: "messages" as DashboardTab, label: "Messages" },
            { key: "portfolio" as DashboardTab, label: "Portfolio" },
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedBooking(null); setSelectedMessageClient(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {tab.label}
              {tab.key === "messages" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">{kpi.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Recent Bookings</h3>
                <button onClick={() => setActiveTab("bookings")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
              </div>
              {bookings.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">No bookings yet</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {bookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-lg shrink-0">
                          <ServiceIcon type={booking.service_type} />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{booking.client_name}</div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{booking.service_type} — {booking.event_date}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={booking.status} />
                        <div className="text-right hidden sm:block">
                          <div className="font-medium text-slate-900 dark:text-white">{booking.total_price_pln.toLocaleString()} PLN</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">{booking.deposit_paid ? "Deposit paid" : "Deposit pending"}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Messages Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white">Recent Messages</h3>
                <button onClick={() => setActiveTab("messages")} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">View All</button>
              </div>
              {messages.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">No messages yet</div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                  {messages.slice(0, 3).map((msg) => (
                    <div key={msg.id} onClick={() => setActiveTab("messages")} className={`p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${!msg.is_read ? "bg-blue-50/50 dark:bg-blue-500/5" : ""}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900 dark:text-white text-sm">{msg.sender_name}</span>
                            {!msg.is_read && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{msg.content}</p>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0">{new Date(msg.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Bookings</h2>
            </div>
            {bookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No bookings yet</h3>
                <p className="text-slate-600 dark:text-slate-400">When clients book you, their requests will appear here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Client</th>
                        <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Event</th>
                        <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Date</th>
                        <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Price</th>
                        <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Status</th>
                        <th className="py-3 px-4 font-medium text-slate-500 dark:text-slate-400">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                      {bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-900 dark:text-white">{booking.client_name}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{booking.client_email}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="capitalize text-slate-900 dark:text-white">{booking.service_type}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{booking.package_name}</div>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{booking.event_date}</td>
                          <td className="py-3 px-4">
                            <div className="text-slate-900 dark:text-white font-medium">{booking.total_price_pln.toLocaleString()} PLN</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">{booking.deposit_paid ? "Paid" : "Unpaid"}</div>
                          </td>
                          <td className="py-3 px-4"><StatusBadge status={booking.status} /></td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2">
                              {booking.status === "pending" && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, "confirmed")} className="px-2 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">Confirm</button>
                              )}
                              {booking.status === "confirmed" && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, "in_progress")} className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">Start</button>
                              )}
                              {booking.status === "in_progress" && (
                                <button onClick={() => handleUpdateBookingStatus(booking.id, "completed")} className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">Complete</button>
                              )}
                              <button onClick={() => setSelectedBooking(selectedBooking?.id === booking.id ? null : booking)} className="px-2 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Details</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Booking Detail Modal */}
            {selectedBooking && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-lg w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Booking Details</h3>
                    <button onClick={() => setSelectedBooking(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Client</span><span className="text-slate-900 dark:text-white font-medium">{selectedBooking.client_name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Email</span><span className="text-slate-900 dark:text-white">{selectedBooking.client_email}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Service</span><span className="text-slate-900 dark:text-white capitalize">{selectedBooking.service_type} — {selectedBooking.package_name}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Date</span><span className="text-slate-900 dark:text-white">{selectedBooking.event_date}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Location</span><span className="text-slate-900 dark:text-white">{selectedBooking.event_location}</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Total Price</span><span className="text-slate-900 dark:text-white font-medium">{selectedBooking.total_price_pln.toLocaleString()} PLN</span></div>
                    <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Deposit</span><span className={selectedBooking.deposit_paid ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{selectedBooking.deposit_paid ? "Paid" : "Pending"}</span></div>
                    {selectedBooking.notes && (
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-slate-500 dark:text-slate-400 text-sm mb-1">Notes</div>
                        <div className="text-slate-900 dark:text-white">{selectedBooking.notes}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
            {messages.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No messages yet</h3>
                <p className="text-slate-600 dark:text-slate-400">When clients message you, conversations will appear here.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                  {/* Conversation List */}
                  <div className="border-r border-slate-200 dark:border-slate-700">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Conversations</h3>
                    </div>
                    <div className="overflow-y-auto max-h-[500px]">
                      {(() => {
                        const grouped = messages.reduce((acc, msg) => {
                          const key = msg.sender_id;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(msg);
                          return acc;
                        }, {} as Record<string, Message[]>);
                        return Object.entries(grouped).map(([senderId, msgs]) => {
                          const lastMsg = msgs[msgs.length - 1];
                          const hasUnread = msgs.some((m) => !m.is_read);
                          return (
                            <button key={senderId} onClick={() => setSelectedMessageClient(senderId)}
                              className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${selectedMessageClient === senderId ? "bg-blue-50 dark:bg-blue-500/5" : ""}`}>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{(lastMsg.sender_name || "?").charAt(0)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-slate-900 dark:text-white text-sm truncate">{lastMsg.sender_name}</span>
                                    {hasUnread && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lastMsg.content}</p>
                                </div>
                              </div>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                  {/* Conversation */}
                  <div className="md:col-span-2 flex flex-col">
                    {selectedMessageClient ? (
                      <>
                        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                          <h3 className="font-semibold text-slate-900 dark:text-white">
                            {messages.find((m) => m.sender_id === selectedMessageClient)?.sender_name || "Conversation"}
                          </h3>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {messages.filter((m) => m.sender_id === selectedMessageClient || m.receiver_id === selectedMessageClient).map((msg) => (
                            <div key={msg.id} className="flex flex-col items-start">
                              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl rounded-tl-sm px-4 py-2.5 max-w-[80%]">
                                <p className="text-sm text-slate-900 dark:text-white">{msg.content}</p>
                              </div>
                              <span className="text-xs text-slate-400 mt-1">{new Date(msg.created_at).toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                          <div className="flex gap-2">
                            <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendReply()} placeholder="Type your message..."
                              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                            <button onClick={handleSendReply} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">Send</button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <div className="text-center">
                          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                          <p className="text-sm">Select a conversation to start messaging</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO TAB */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Portfolio</h2>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">+ Add Work</button>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center">
              <svg className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Portfolio Management</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-4">Upload and manage your portfolio items here. Your work will be displayed on your public portfolio page.</p>
              <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 max-w-md mx-auto">Connect your portfolio to your team profile to make it visible on the website.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
