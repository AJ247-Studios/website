/**
 * SecurityPanel Component
 * 
 * Security settings:
 * - 2FA toggle
 * - Active sessions
 * - Sign out everywhere
 */

"use client";

import { useState } from "react";

interface Session {
  id: string;
  device: string;
  browser: string;
  location?: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

interface SecurityPanelProps {
  twoFactorEnabled: boolean;
  sessions: Session[];
  onToggle2FA: (enabled: boolean) => Promise<void>;
  onSignOutSession: (sessionId: string) => Promise<void>;
  onSignOutAll: () => Promise<void>;
}

export function SecurityPanel({
  twoFactorEnabled,
  sessions,
  onToggle2FA,
  onSignOutSession,
  onSignOutAll,
}: SecurityPanelProps) {
  const [toggling2FA, setToggling2FA] = useState(false);
  const [signingOut, setSigningOut] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const handleToggle2FA = async () => {
    setToggling2FA(true);
    try {
      await onToggle2FA(!twoFactorEnabled);
    } catch (error) {
      console.error("Failed to toggle 2FA:", error);
    } finally {
      setToggling2FA(false);
    }
  };

  const handleSignOutSession = async (sessionId: string) => {
    setSigningOut(sessionId);
    try {
      await onSignOutSession(sessionId);
    } catch (error) {
      console.error("Failed to sign out session:", error);
    } finally {
      setSigningOut(null);
    }
  };

  const handleSignOutAll = async () => {
    setSigningOutAll(true);
    try {
      await onSignOutAll();
    } catch (error) {
      console.error("Failed to sign out all sessions:", error);
    } finally {
      setSigningOutAll(false);
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getDeviceIcon = (device: string) => {
    const lower = (device || '').toLowerCase();
    if (lower.includes("mobile") || lower.includes("phone") || lower.includes("iphone") || lower.includes("android")) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    if (lower.includes("tablet") || lower.includes("ipad")) {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    );
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Security
        </h3>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800">
        {/* 2FA Section */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${twoFactorEnabled ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-slate-100 dark:bg-slate-800"}`}>
                <svg
                  className={`w-5 h-5 ${twoFactorEnabled ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {twoFactorEnabled
                    ? "Your account is protected with 2FA"
                    : "Add an extra layer of security to your account"}
                </p>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              disabled={toggling2FA}
              className={`relative shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                twoFactorEnabled
                  ? "bg-emerald-600"
                  : "bg-slate-200 dark:bg-slate-700"
              } ${toggling2FA ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  twoFactorEnabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-slate-900 dark:text-white">
              Active Sessions
            </h4>
            {sessions.length > 1 && (
              <button
                onClick={handleSignOutAll}
                disabled={signingOutAll}
                className="text-sm text-red-600 dark:text-red-400 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signingOutAll ? "Signing out..." : "Sign out all"}
              </button>
            )}
          </div>

          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`flex items-start justify-between gap-3 p-3 rounded-lg ${
                  session.is_current
                    ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                    : "bg-slate-50 dark:bg-slate-800/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      session.is_current
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {getDeviceIcon(session.device)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {session.device}
                      {session.is_current && (
                        <span className="ml-2 text-xs font-normal text-blue-600 dark:text-blue-400">
                          Current session
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {session.browser}
                      {session.location && ` • ${session.location}`}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                      Last active {formatTimeAgo(session.last_active)}
                    </p>
                  </div>
                </div>
                {!session.is_current && (
                  <button
                    onClick={() => handleSignOutSession(session.id)}
                    disabled={signingOut === session.id}
                    className="shrink-0 p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Sign out this session"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security tip */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              If you notice any unfamiliar sessions, sign them out immediately and change your password.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SecurityPanel;
