"use client";

/**
 * DEV-ONLY: Auth Test Page
 * 
 * Visit /_dev/auth-test while running locally to:
 * - Inspect current session state
 * - View localStorage keys
 * - Test auth state changes
 * - Debug session rehydration issues
 * 
 * DO NOT deploy this to production or protect it behind auth.
 */

import { useSupabase } from "@/components/SupabaseProvider";
import { useEffect, useState } from "react";
import { debugSession, debugStorage } from "@/utils/supabase-browser";

export default function AuthTestPage() {
  const { session, user, role, isLoading, supabase } = useSupabase();
  const [localStorageKeys, setLocalStorageKeys] = useState<Record<string, string | null>>({});
  const [manualSession, setManualSession] = useState<unknown>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Load localStorage keys on mount and after refresh
  useEffect(() => {
    const keys = debugStorage();
    setLocalStorageKeys(keys);
    
    // Also fetch session directly for comparison
    debugSession().then(setManualSession);
  }, [refreshCount]);

  const handleRefresh = async () => {
    setRefreshCount((c) => c + 1);
    const sess = await debugSession();
    setManualSession(sess);
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Sign out error:", error);
      alert(`Sign out error: ${error.message}`);
    } else {
      setRefreshCount((c) => c + 1);
    }
  };

  const handleForceRefreshToken = async () => {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) {
      console.error("Refresh token error:", error);
      alert(`Refresh error: ${error.message}`);
    } else {
      console.log("Token refreshed:", data);
      setRefreshCount((c) => c + 1);
    }
  };

  // Don't render anything in production
  if (process.env.NODE_ENV === "production") {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">Not Available</h1>
        <p>This page is only available in development mode.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔐 Auth Debug Page</h1>
      
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Refresh Data
        </button>
        <button
          onClick={handleForceRefreshToken}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
        >
          Force Token Refresh
        </button>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Sign Out
        </button>
      </div>

      {/* Loading State */}
      <section className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">⏳ Loading State</h2>
        <div className={`text-lg font-mono ${isLoading ? "text-yellow-600" : "text-green-600"}`}>
          isLoading: {isLoading ? "true" : "false"}
        </div>
      </section>

      {/* Context Session */}
      <section className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">📦 Context State (useSupabase)</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium text-gray-600">User</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-48">
              {JSON.stringify(
                user
                  ? {
                      id: user.id,
                      email: user.email,
                      phone: user.phone,
                      created_at: user.created_at,
                      last_sign_in_at: user.last_sign_in_at,
                    }
                  : null,
                null,
                2
              )}
            </pre>
          </div>
          <div>
            <h3 className="font-medium text-gray-600">Session</h3>
            <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-48">
              {JSON.stringify(
                session
                  ? {
                      access_token: session.access_token?.slice(0, 20) + "...",
                      refresh_token: session.refresh_token?.slice(0, 10) + "...",
                      expires_at: session.expires_at,
                      expires_at_readable: session.expires_at
                        ? new Date(session.expires_at * 1000).toISOString()
                        : null,
                      token_type: session.token_type,
                    }
                  : null,
                null,
                2
              )}
            </pre>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-medium text-gray-600">Role</h3>
          <div className="text-lg font-mono">{role ?? "null"}</div>
        </div>
      </section>

      {/* Direct Session Check */}
      <section className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">🔍 Direct getSession() Result</h2>
        <p className="text-sm text-gray-500 mb-2">
          This calls supabase.auth.getSession() directly to compare with context state
        </p>
        <pre className="text-sm bg-white p-2 rounded border overflow-auto max-h-64">
          {JSON.stringify(manualSession, null, 2)}
        </pre>
      </section>

      {/* localStorage */}
      <section className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">💾 localStorage (Supabase keys)</h2>
        {Object.keys(localStorageKeys).length === 0 ? (
          <p className="text-gray-500 italic">No Supabase-related keys found in localStorage</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(localStorageKeys).map(([key, value]) => (
              <div key={key} className="bg-white p-2 rounded border">
                <div className="font-mono text-sm font-medium text-blue-600">{key}</div>
                <pre className="text-xs text-gray-600 overflow-auto max-h-24 mt-1">{value}</pre>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Status */}
      <section className="mb-8 p-4 border rounded bg-gray-50">
        <h2 className="text-xl font-semibold mb-2">✅ Quick Status Check</h2>
        <ul className="space-y-2">
          <li className={session ? "text-green-600" : "text-red-600"}>
            {session ? "✓" : "✗"} Session exists in context
          </li>
          <li className={user ? "text-green-600" : "text-red-600"}>
            {user ? "✓" : "✗"} User exists in context
          </li>
          <li className={role ? "text-green-600" : "text-yellow-600"}>
            {role ? "✓" : "○"} Role loaded: {role ?? "none"}
          </li>
          <li className={!isLoading ? "text-green-600" : "text-yellow-600"}>
            {!isLoading ? "✓" : "○"} Loading complete
          </li>
          <li className={Object.keys(localStorageKeys).length > 0 ? "text-green-600" : "text-red-600"}>
            {Object.keys(localStorageKeys).length > 0 ? "✓" : "✗"} Supabase keys in localStorage
          </li>
        </ul>
      </section>

      {/* Instructions */}
      <section className="p-4 border rounded bg-blue-50">
        <h2 className="text-xl font-semibold mb-2">📋 Testing Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Open DevTools Console and check for [Auth] logs</li>
          <li>Refresh this page - session should persist</li>
          <li>Click "Sign Out" - all fields should clear</li>
          <li>Sign in on another tab - come back here and click "Refresh Data"</li>
          <li>Hard refresh (Ctrl+Shift+R) - session should still persist</li>
          <li>Check Console for: <code className="bg-white px-1">[Auth] initial session</code> and <code className="bg-white px-1">[Auth] onAuthStateChange</code></li>
        </ol>
      </section>
    </div>
  );
}
