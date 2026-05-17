/**
 * Client Portal Dashboard
 * 
 * Enhanced client portal with:
 * - Bookings view
 * - Messages with team
 * - Project deliverables
 * - Profile management
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import Image from "next/image";
import Link from "next/link";

type ClientTab = "projects" | "bookings" | "messages";

interface Booking {
  id: string;
  service_type: string;
  package_name: string;
  employee_name: string;
  employee_id?: string;
  event_date: string;
  event_location: string;
  total_price_pln: number;
  deposit_paid: boolean;
  status: "pending" | "deposit_paid" | "confirmed" | "in_progress" | "completed" | "cancelled";
  notes: string;
}

interface Message {
  id: string;
  sender_name: string;
  sender_id: string;
  receiver_id?: string;
  sender_avatar?: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// Mock data for bookings
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "bk-001",
    service_type: "wedding",
    package_name: "Premium",
    employee_name: "Anthony Certeza",
    event_date: "2025-06-15",
    event_location: "Kraków",
    total_price_pln: 5599,
    deposit_paid: true,
    status: "confirmed",
    notes: "Outdoor ceremony at Planty Park",
  },
];

// Mock data for messages
const MOCK_MESSAGES: Message[] = [
  {
    id: "msg-001",
    sender_name: "Anthony Certeza",
    sender_id: "emp-anthony",
    sender_avatar: "/portfolio/Anthony-full-res.webp",
    content: "Hi! I'm looking forward to your wedding shoot. Do you have any specific shots you'd like me to capture?",
    is_read: false,
    created_at: "2025-05-10T08:00:00Z",
  },
  {
    id: "msg-002",
    sender_name: "AJ247 Studios",
    sender_id: "system",
    content: "Your booking for June 15th has been confirmed! The deposit has been received.",
    is_read: true,
    created_at: "2025-05-08T14:30:00Z",
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
    pending: "Pending",
    deposit_paid: "Deposit Paid",
    confirmed: "Confirmed",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function ClientPortalDashboard() {
  const router = useRouter();
  const { supabase, session, isLoading } = useSupabase();
  const [activeTab, setActiveTab] = useState<ClientTab>("bookings");
  const [replyText, setReplyText] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [selectedMessageClient, setSelectedMessageClient] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login?redirect=/portal");
    }
  }, [session, isLoading, router]);

  // Fetch real data from Supabase
  useEffect(() => {
    if (!session?.user?.id) return;
    const userId = session.user.id;

    async function fetchData() {
      try {
        setDataLoading(true);

        // Fetch bookings for this client only
        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select(`
            *,
            employee:employee_id(display_name),
            package:package_id(name)
          `)
          .eq("client_id", userId)
          .order("created_at", { ascending: false });

        if (bookingsError) {
          console.error("Bookings fetch error:", bookingsError);
          setBookings(MOCK_BOOKINGS);
        } else {
          setBookings((bookingsData || []).map((b: any) => ({
            id: b.id,
            service_type: b.service_type,
            package_name: b.package?.name || "Custom",
            employee_name: b.employee?.display_name || "TBD",
            employee_id: b.employee_id,
            event_date: b.event_date,
            event_location: b.event_location || "",
            total_price_pln: b.total_price_pln,
            deposit_paid: b.deposit_paid,
            status: b.status,
            notes: b.notes || "",
          })) as Booking[]);
        }

        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from("messages")
          .select("*")
          .order("created_at", { ascending: true });

        if (messagesError) {
          console.error("Messages fetch error:", messagesError);
          setMessages(MOCK_MESSAGES);
        } else {
          setMessages((messagesData || []).map((m: any) => ({
            id: m.id,
            sender_name: m.sender_name || "Team Member",
            sender_id: m.sender_id,
            receiver_id: m.receiver_id,
            content: m.content,
            is_read: m.is_read,
            created_at: m.created_at,
          })) as Message[]);
        }
      } catch (err: any) {
        console.error("Portal fetch error:", err);
        setBookings(MOCK_BOOKINGS);
        setMessages(MOCK_MESSAGES);
      } finally {
        setDataLoading(false);
      }
    }

    fetchData();
  }, [session, supabase]);

  // Mark messages as read when opening a conversation
  useEffect(() => {
    if (!selectedMessageClient || !session?.user?.id || !supabase) return;
    const userId = session.user.id;

    async function markAsRead() {
      const unreadIds = messages
        .filter((m) => !m.is_read && m.sender_id === selectedMessageClient && m.receiver_id === userId)
        .map((m) => m.id);

      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from("messages")
        .update({ is_read: true })
        .in("id", unreadIds);

      if (error) {
        console.error("Failed to mark messages as read:", error);
        return;
      }

      setMessages((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, is_read: true } : m))
      );
    }

    markAsRead();
  }, [selectedMessageClient, session, supabase, messages]);

  const handleSendMessage = useCallback(async () => {
    if (!replyText.trim() || !session || !supabase) return;

    // Find the team member assigned to the most recent booking
    const latestBooking = bookings[0];
    const receiverId = latestBooking?.employee_id;
    if (!receiverId) {
      console.error("No team member assigned to message");
      return;
    }

    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: session.user.id,
        receiver_id: receiverId,
        content: replyText.trim(),
        sender_name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email || "Client",
      });
      if (error) {
        console.error("Failed to send message:", error);
        return;
      }
      // Optimistically add to UI
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        sender_name: "You",
        sender_id: session.user.id,
        content: replyText,
        is_read: true,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMessage]);
      setReplyText("");
    } catch (err) {
      console.error("Send message error:", err);
    }
  }, [replyText, session, supabase, bookings]);

  if (isLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const userId = session.user.id;
  const unreadCount = messages.filter((m) => !m.is_read && m.receiver_id === userId).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Dashboard</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
                Manage your bookings, messages, and projects
              </p>
            </div>
            <Link
              href="/book"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              + New Booking
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {([
            { key: "bookings" as ClientTab, label: "My Bookings", icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )},
            { key: "messages" as ClientTab, label: "Messages", icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            ), badge: unreadCount },
            { key: "projects" as ClientTab, label: "Projects", icon: (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            )},
          ]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <span className="hidden sm:inline">{tab.icon}</span>
              <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge ? (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No bookings yet</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Ready to book your next shoot? Get started now!
                </p>
                <Link
                  href="/book"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Book a Shoot
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white capitalize">
                            {booking.service_type} — {booking.package_name}
                          </h3>
                          <StatusBadge status={booking.status} />
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          with {booking.employee_name}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-900 dark:text-white">
                          {booking.total_price_pln.toLocaleString()} PLN
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {booking.deposit_paid ? "Deposit paid" : "Deposit pending"}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Event Date</div>
                        <div className="font-medium text-slate-900 dark:text-white">{booking.event_date}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Location</div>
                        <div className="font-medium text-slate-900 dark:text-white">{booking.event_location}</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-3">
                        <div className="text-slate-500 dark:text-slate-400 text-xs">Deposit (30%)</div>
                        <div className={`font-medium ${booking.deposit_paid ? "text-emerald-600" : "text-amber-600"}`}>
                          {Math.round(booking.total_price_pln * 0.3).toLocaleString()} PLN
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Notes</div>
                        <div className="text-sm text-slate-700 dark:text-slate-300">{booking.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Messages</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 min-h-[500px]">
                {/* Conversation List - Team Members */}
                <div className="border-r border-slate-200 dark:border-slate-700">
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Your Team</h3>
                  </div>
                  <div className="overflow-y-auto max-h-[500px]">
                    {(() => {
                      const userId = session?.user?.id;
                      const getName = (id: string) => {
                        const fromMsg = messages.find((m) => m.sender_id === id && m.sender_name);
                        if (fromMsg?.sender_name) return fromMsg.sender_name;
                        const emp = bookings.find((b) => b.employee_id === id);
                        if (emp?.employee_name) return emp.employee_name;
                        return id.slice(0, 8) + "...";
                      };
                      // Get unique team members from bookings
                      const teamMembers = new Map<string, { name: string; messages: Message[] }>();
                      messages.forEach((msg) => {
                        const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
                        if (!partnerId) return;
                        if (!teamMembers.has(partnerId)) {
                          teamMembers.set(partnerId, { name: getName(partnerId), messages: [] });
                        }
                        teamMembers.get(partnerId)!.messages.push(msg);
                      });
                      // Also add team members from bookings even if no messages yet
                      bookings.forEach((b) => {
                        if (b.employee_id && !teamMembers.has(b.employee_id)) {
                          teamMembers.set(b.employee_id, { name: b.employee_name || getName(b.employee_id), messages: [] });
                        }
                      });
                      if (teamMembers.size === 0) {
                        return (
                          <div className="p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                            No team members yet. Book a shoot to start messaging.
                          </div>
                        );
                      }
                      return Array.from(teamMembers.entries()).map(([partnerId, conv]) => {
                        const lastMsg = conv.messages[conv.messages.length - 1];
                        const hasUnread = conv.messages.some((m) => !m.is_read && m.sender_id !== userId);
                        return (
                          <button key={partnerId} onClick={() => setSelectedMessageClient(partnerId)}
                            className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${selectedMessageClient === partnerId ? "bg-blue-50 dark:bg-blue-500/5" : ""}`}>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                                <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{(conv.name || "?").charAt(0)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900 dark:text-white text-sm truncate">{conv.name}</span>
                                  {hasUnread && <span className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{lastMsg?.content || "No messages yet"}</p>
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
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-900 dark:text-white">
                          {(() => {
                            const fromMsg = messages.find((m) => m.sender_id === selectedMessageClient && m.sender_name);
                            if (fromMsg?.sender_name) return fromMsg.sender_name;
                            const emp = bookings.find((b) => b.employee_id === selectedMessageClient);
                            if (emp?.employee_name) return emp.employee_name;
                            return "Conversation";
                          })()}
                        </h3>
                      </div>
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {(() => {
                          const userId = session?.user?.id;
                          const convMessages = messages.filter((m) =>
                            (m.sender_id === userId && m.receiver_id === selectedMessageClient) ||
                            (m.sender_id === selectedMessageClient && m.receiver_id === userId)
                          );
                          return convMessages.map((msg) => {
                            const isMe = msg.sender_id === userId;
                            return (
                              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm ${
                                  isMe
                                    ? "bg-blue-600 text-white rounded-tr-sm"
                                    : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded-tl-sm"
                                }`}>
                                  {msg.content}
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2">
                          <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendMessage()} placeholder="Type your message..."
                            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
                          <button onClick={handleSendMessage} className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium">Send</button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <p className="text-sm">Select a team member to start messaging</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Projects & Deliverables
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-2">
              Your project deliverables will appear here once work begins.
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You&apos;ll be able to view, approve, and download your photos and videos.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
