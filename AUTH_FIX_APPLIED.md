# Authentication Fix Applied

## Problem Fixed
The 406 "Not Acceptable" errors on `/profiles` requests and the Admin link disappearing after reload were caused by **client-side role fetching using ANON_KEY**, which is blocked by RLS policies.

## Root Cause
- `Header.tsx` was calling `supabase.from("profiles").select("role")` with ANON_KEY
- This violates RLS because only the user's own profile can be read with ANON_KEY
- The 406 response meant RLS rejected the request
- Role state became null, causing the Admin link to disappear

## Solution Implemented

### 1. **Header.tsx** - Removed Client-Side Role Fetch
**Before:** 
```tsx
useEffect(() => {
  // Fetch role on every session change
  const fetchRole = async (currentSession: Session) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentSession.user.id)
      .single(); // ❌ Uses ANON_KEY, hits RLS, returns 406
    setRole(profile?.role || null);
  };
  
  supabase.auth.onAuthStateChange(async (_event, sess) => {
    setSession(sess);
    if (sess) await fetchRole(sess); // ❌ Fetches role client-side
  });
}, []);
```

**After:**
```tsx
useEffect(() => {
  // Only listen for session changes, don't fetch role
  const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
    setSession(sess);
    // Role stays as server-provided, no client-side fetch
  });
  
  return () => {
    listener.subscription.unsubscribe();
  };
}, []); // ✅ Empty dependency array - runs once
```

### 2. **app/layout.tsx** - Already Correct
- Uses `SERVICE_ROLE_KEY` via `createServerClient` to bypass RLS
- Fetches role server-side on every page render
- Passes `initialRole` to Header component

### 3. **middleware.ts** - Already Correct
- Uses `SERVICE_ROLE_KEY` via `supabaseAdmin` for `/admin` route protection
- Bypasses RLS to safely check user role

## Key Changes Summary

| File | Change | Impact |
|------|--------|--------|
| `components/Header.tsx` | Removed `fetchRole()` async function | No more 406 errors |
| `components/Header.tsx` | Removed role re-fetch on auth state change | Role stays stable |
| `components/Header.tsx` | Removed `loading` state | Cleaner rendering |
| `components/Header.tsx` | Changed dependency from `[initialSession, initialRole]` to `[]` | Simpler lifecycle |

## How It Works Now

1. **Page loads** → `app/layout.tsx` (server component)
   - Gets session via `getSession()` with ANON_KEY
   - If logged in, fetches role using SERVICE_ROLE_KEY
   - Passes `initialSession` and `initialRole` to Header

2. **Header renders** (client component)
   - Receives `initialRole` from server
   - Displays Admin link immediately if `role === "admin"`
   - Only listens for session changes, doesn't refetch role

3. **User logs out** → Browser triggers redirect
   - Middleware handles session cleanup
   - Next page load refetches role server-side

4. **On page reload** → Back to step 1
   - Layout refetches everything server-side
   - Header gets fresh `initialRole`
   - No client-side role fetch = no 406 errors

## Testing Checklist

- [ ] Log in as admin user
- [ ] Verify Admin link appears in header
- [ ] Refresh the page
- [ ] Admin link should **still be visible** (not disappear)
- [ ] Check browser console - **no 406 errors on /profiles**
- [ ] Navigate to `/admin` - should load without kicking you out
- [ ] Log out - Admin link should disappear
- [ ] Log back in - Admin link should reappear

## Files Modified
- `components/Header.tsx` - Fixed client-side role fetching

## Files Not Changed (Already Correct)
- `app/layout.tsx` - Server-side role fetch is correct
- `middleware.ts` - Admin route protection is correct
- `lib/supabase-admin.ts` - Service role client is correct
- `supabase/migrations/create_profiles_table.sql` - RLS policies are correct

## Why This Works

1. **Server fetches role once** - With SERVICE_ROLE_KEY (can read all profiles)
2. **Client trusts server** - Never tries to fetch role again
3. **RLS stays intact** - Users can read their own profile with ANON_KEY if needed
4. **No race conditions** - Role comes from server, not async client fetch
5. **Session & role stay in sync** - Both come from server at the same time

## Next Steps
If you still see issues after this fix, it would likely be:
1. User profile not created on signup (check `handle_new_user()` trigger)
2. Role not set to "admin" in database (verify via Supabase dashboard)
3. Cache issues in browser (hard refresh with Ctrl+Shift+R)
