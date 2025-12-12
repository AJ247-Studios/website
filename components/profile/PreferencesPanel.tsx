/**
 * PreferencesPanel Component
 * 
 * Profile edit and preferences:
 * - Contact method preferences
 * - Notification settings
 * - Default download resolution
 * - GDPR data export/delete
 */

"use client";

import { useState } from "react";
import type { ClientProfile, ClientPreferences } from "@/lib/types/portal";

interface PreferencesPanelProps {
  profile: ClientProfile;
  onSave: (updates: Partial<ClientProfile>) => Promise<void>;
  onExportData?: () => void;
  onDeleteAccount?: () => void;
}

export function PreferencesPanel({
  profile,
  onSave,
  onExportData,
  onDeleteAccount,
}: PreferencesPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone || "",
    company: profile.company || "",
    contact_method: profile.preferences?.contact_method || "email",
    notification_email: profile.preferences?.notification_email ?? true,
    notification_sms: profile.preferences?.notification_sms ?? false,
    timezone: profile.preferences?.timezone || "Europe/Warsaw",
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        preferences: {
          ...profile.preferences,
          contact_method: formData.contact_method as ClientPreferences["contact_method"],
          notification_email: formData.notification_email,
          notification_sms: formData.notification_sms,
          timezone: formData.timezone,
        },
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setSaving(false);
    }
  };

  const timezones = [
    { value: "Europe/Warsaw", label: "Warsaw (CET)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Paris (CET)" },
    { value: "Europe/Berlin", label: "Berlin (CET)" },
    { value: "America/New_York", label: "New York (EST)" },
    { value: "America/Los_Angeles", label: "Los Angeles (PST)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          Profile & Preferences
        </h3>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Edit
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Basic info */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Basic Information
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-sm text-slate-900 dark:text-white">
                  {profile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData({ ...formData, company: e.target.value })
                  }
                  placeholder="Optional"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-sm text-slate-900 dark:text-white">
                  {profile.company || "—"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-sm text-slate-900 dark:text-white">
                  {profile.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+48 123 456 789"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <p className="text-sm text-slate-900 dark:text-white">
                  {profile.phone || "—"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Communication preferences */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Communication
          </h4>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Preferred Contact Method
            </label>
            <div className="flex flex-wrap gap-2">
              {(["email", "phone", "whatsapp"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  disabled={!isEditing}
                  onClick={() =>
                    setFormData({ ...formData, contact_method: method })
                  }
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                    formData.contact_method === method
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
                  } ${
                    isEditing
                      ? "hover:bg-blue-500 hover:text-white hover:border-blue-500 cursor-pointer"
                      : "cursor-default"
                  }`}
                >
                  {method.charAt(0).toUpperCase() + method.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
              Notifications
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notification_email}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notification_email: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Email notifications
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.notification_sms}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      notification_sms: e.target.checked,
                    })
                  }
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  SMS notifications
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
              Timezone
            </label>
            {isEditing ? (
              <select
                value={formData.timezone}
                onChange={(e) =>
                  setFormData({ ...formData, timezone: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-sm text-slate-900 dark:text-white">
                {timezones.find((tz) => tz.value === formData.timezone)?.label ||
                  formData.timezone}
              </p>
            )}
          </div>
        </div>

        {/* Save/Cancel buttons */}
        {isEditing && (
          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: profile.name,
                  email: profile.email,
                  phone: profile.phone || "",
                  company: profile.company || "",
                  contact_method:
                    profile.preferences?.contact_method || "email",
                  notification_email:
                    profile.preferences?.notification_email ?? true,
                  notification_sms:
                    profile.preferences?.notification_sms ?? false,
                  timezone: profile.preferences?.timezone || "Europe/Warsaw",
                });
              }}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Data management (GDPR) */}
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Data Management
          </h4>
          <div className="flex flex-wrap gap-3">
            {onExportData && (
              <button
                onClick={onExportData}
                className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Export my data
              </button>
            )}
            {onDeleteAccount && (
              <button
                onClick={onDeleteAccount}
                className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete my account
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            You can request an export of all your data or delete your account at
            any time.
          </p>
        </div>
      </div>
    </section>
  );
}

export default PreferencesPanel;
