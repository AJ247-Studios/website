"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";
import Image from "next/image";

export default function ProfilePage() {
  const { supabase, session, role, isLoading: authLoading } = useSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    display_name: "",
    email: "",
    phone: "",
    company: "",
    avatar_url: "",
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login?redirect=/profile");
    }
  }, [session, authLoading, router]);

  // Load profile from Supabase
  useEffect(() => {
    if (!session?.user?.id || !supabase) return;

    async function loadProfile() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("user_profiles")
          .select("display_name, phone, company, avatar_url")
          .eq("id", session!.user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Profile load error:", error);
        }

        setForm({
          display_name: data?.display_name || session!.user.user_metadata?.full_name || session!.user.user_metadata?.name || "",
          email: session!.user.email || "",
          phone: data?.phone || "",
          company: data?.company || "",
          avatar_url: data?.avatar_url || "",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [session, supabase]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setMessage(null);
  };

  const handleSave = async () => {
    if (!session?.user?.id || !supabase) return;
    setSaving(true);
    setMessage(null);

    try {
      // Update user_profiles table
      const { error: profileError } = await supabase
        .from("user_profiles")
        .upsert({
          id: session.user.id,
          email: session.user.email,
          role: role || "user",
          display_name: form.display_name,
          phone: form.phone || null,
          company: form.company || null,
          avatar_url: form.avatar_url || null,
        }, { onConflict: "id" });

      if (profileError) {
        throw new Error(profileError.message);
      }

      // Update auth user metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: form.display_name },
      });

      if (authError) {
        throw new Error(authError.message);
      }

      setMessage({ type: "success", text: "Profile saved successfully!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to save profile" });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const initials = (form.display_name || form.email || "U").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Your Profile</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your personal information and preferences</p>
        </div>

        {/* Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl text-sm ${
            message.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          {/* Avatar Section */}
          <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-2xl sm:text-3xl font-bold text-slate-600 dark:text-slate-300 shrink-0">
                {form.avatar_url ? (
                  <Image src={form.avatar_url} alt="Avatar" width={96} height={96} className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {form.display_name || "Unnamed User"}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">{form.email}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Role: {session.user.user_metadata?.role || "user"}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={form.display_name}
                onChange={(e) => handleChange("display_name", e.target.value)}
                placeholder="Your full name"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                disabled
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Contact support to change your email</p>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+48 123 456 789"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Company / Organization
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleChange("company", e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Avatar URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Avatar URL
              </label>
              <input
                type="url"
                value={form.avatar_url}
                onChange={(e) => handleChange("avatar_url", e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Paste a direct image URL</p>
            </div>

            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Saving...
                  </span>
                ) : (
                  "Save Profile"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
