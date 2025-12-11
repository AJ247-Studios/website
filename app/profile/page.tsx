"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

interface UserProfile {
  email: string;
  role?: string;
  display_name?: string;
  avatar_url?: string;
  projects?: string[];
  created_at?: string;
}

export default function ProfilePage() {
  const { supabase, session, role: userRole, isLoading: sessionLoading } = useSupabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push("/login");
    }
  }, [session, sessionLoading, router]);

  // Load profile data when session is available
  useEffect(() => {
    // Don't do anything while session is still loading
    if (sessionLoading) return;
    
    // If no session after loading completes, stop loading (redirect will happen)
    if (!session) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {

      // Fetch user profile from database
      // Try both tables for compatibility
      // Define a type for profile data
      let prof: { role?: string; display_name?: string; avatar_url?: string } | null = null;
      
      // Try user_profiles first (legacy)
      const { data: userProf } = await supabase
        .from('user_profiles')
        .select('role, display_name, avatar_url')
        .eq('id', session.user.id)
        .single();
      
      if (userProf) {
        prof = userProf;
      } else {
        // Fall back to profiles table (only has role)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();
        prof = profileData ? { role: profileData.role, display_name: undefined, avatar_url: undefined } : null;
      }

      setProfile({
        email: session.user.email || "",
        role: prof?.role || userRole || "user",
        display_name: prof?.display_name || "",
        avatar_url: prof?.avatar_url || "",
        projects: [],
        created_at: session.user.created_at,
      });
      setDisplayName(prof?.display_name || "");
      setLoading(false);
    };

    loadProfile();
  }, [session, sessionLoading, supabase, userRole]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      if (!session?.user) return;
      const { error } = await supabase
        .from('user_profiles')
        .update({ display_name: displayName })
        .eq('id', session.user.id);
      if (error) setProfileMsg(error.message);
      else setProfileMsg('Profile updated');
    } finally {
      setSavingProfile(false);
      setTimeout(() => setProfileMsg(""), 2000);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !session?.user) return;
    const path = `${session.user.id}/${Date.now()}-${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });
    if (uploadError) {
      setProfileMsg(uploadError.message);
      return;
    }
    const { data: publicUrl } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
    await supabase.from('user_profiles').update({ avatar_url: publicUrl.publicUrl }).eq('id', session.user.id);
    setProfile((p) => p ? { ...p, avatar_url: publicUrl.publicUrl } : p);
    setProfileMsg('Avatar updated');
    setTimeout(() => setProfileMsg(""), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      setPasswordLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      setPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      setPasswordLoading(false);
      return;
    }

    try {
      // First, verify current password by attempting to sign in
      if (session?.user.email) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: session.user.email,
          password: currentPassword,
        });

        if (verifyError) {
          setPasswordError("Current password is incorrect");
          setPasswordLoading(false);
          return;
        }
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setPasswordError(updateError.message);
      } else {
        setPasswordSuccess("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordOpen(false);
        setTimeout(() => setPasswordSuccess(""), 3000);
      }
    } catch (err) {
      setPasswordError("An unexpected error occurred");
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!session || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            My Account
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white mb-6">
            Account Information
          </h2>

          <div className="space-y-6">
            {/* Avatar + Display Name */}
            <div className="flex items-center gap-4">
              <img src={profile.avatar_url || '/default-avatar.png'} alt="Avatar" className="w-16 h-16 rounded-full object-cover border" />
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Display Name</label>
                <form onSubmit={handleSaveProfile} className="flex gap-2">
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                  <button type="submit" disabled={savingProfile} className="px-3 py-2 bg-blue-600 text-white rounded-lg">{savingProfile ? 'Saving...' : 'Save'}</button>
                </form>
                {profileMsg && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{profileMsg}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Avatar</label>
                <input type="file" accept="image/*" onChange={handleAvatarUpload} />
              </div>
            </div>
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Email Address
              </label>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <p className="text-slate-900 dark:text-white font-medium">{profile.email}</p>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Account Type
              </label>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                  {profile.role}
                </span>
              </div>
            </div>

            {/* Projects */}
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Linked Projects
              </label>
              {profile.projects && profile.projects.length > 0 ? (
                <div className="space-y-2">
                  {profile.projects.map((project, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                      <p className="text-slate-900 dark:text-white">{project}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-600 dark:text-slate-400">No projects linked yet</p>
                </div>
              )}
            </div>

            {/* Member Since */}
            {profile.created_at && (
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                  Member Since
                </label>
                <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
                  <p className="text-slate-900 dark:text-white">
                    {new Date(profile.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Card */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Security
            </h2>
          </div>

          {!passwordOpen ? (
            <button
              onClick={() => setPasswordOpen(true)}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-900 dark:text-white font-medium rounded-lg transition-colors duration-200"
            >
              Change Password
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-700 dark:text-green-400 text-sm">
                  {passwordSuccess}
                </div>
              )}

              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPasswordOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordError("");
                  }}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
