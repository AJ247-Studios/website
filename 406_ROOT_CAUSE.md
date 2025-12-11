# 406 Error Root Cause Analysis & Fix

## The 406 "Not Acceptable" Error

When you saw this in the console:
```
Failed to load resource: the server responded with a status of 406
URL: /profiles?select=role&id=eq.<YOUR_UUID>
```

This meant: **Your browser sent a request Supabase rejected because it violated Row Level Security (RLS) policies.**

---

## Why Did This Happen?

### The Problem Flow

1. **User logs in** → Session created ✅
2. **Page loads** → `app/layout.tsx` (server-side)
   - Fetches role using SERVICE_ROLE_KEY ✅ (works, bypasses RLS)
   - Passes `initialRole="admin"` to Header ✅
3. **Header renders** (client-side)
   - Receives `initialRole="admin"` ✅
4. **useEffect runs** in Header
   - Tries: `supabase.from("profiles").select("role").eq("id", userID)` ❌
   - This uses ANON_KEY (the browser client)
   - RLS policy says: "Users can only read their own profile"
   - But the query doesn't include authentication context properly in the old code
   - **Supabase rejects with 406** ❌
5. **`setRole(null)` runs** (because fetch failed)
6. **Admin link disappears** ❌
7. **Page reloads** → Back to step 2, but now role is null because localStorage/state is gone

---

## The RLS Policy

```sql
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);
```

This says: *"You can SELECT from profiles ONLY if the record's id matches your user ID"*

### Why ANON_KEY Failed

The old code in Header tried to:
```ts
supabase.from("profiles")
  .select("role")
  .eq("id", currentSession.user.id) // Query for user's own profile
  .single();
```

Even though this is technically the user querying their own profile, there are edge cases where:
1. Session state isn't properly propagated to the query
2. Auth context isn't consistently maintained in the browser
3. Cookie-based auth has timing issues

The safest approach: **Never fetch role client-side. Fetch server-side only.**

---

## The Fix

### Remove Client-Side Role Fetch

**Delete this entire flow from Header.tsx:**
```tsx
// ❌ OLD - Don't do this
const fetchRole = async (currentSession: Session) => {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentSession.user.id)
    .single();
  setRole(profile?.role || null);
};

useEffect(() => {
  supabase.auth.onAuthStateChange(async (_event, sess) => {
    setSession(sess);
    if (sess) await fetchRole(sess); // ← This causes 406
  });
}, [initialSession, initialRole]);
```

**Replace with this:**
```tsx
// ✅ NEW - Trust the server
useEffect(() => {
  const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
    setSession(sess);
    // That's it! Role came from server, stays as is.
  });
  
  return () => {
    listener.subscription.unsubscribe();
  };
}, []);
```

---

## Why This Works

### Before (Broken)
```
Layout renders
  ↓ (server-side, SERVICE_ROLE_KEY)
  role = "admin" ✅
  ↓ (pass to Header)
Header receives initialRole = "admin" ✅
  ↓
useEffect in Header
  ↓ (client-side, ANON_KEY)
  Tries to fetch role from /profiles ❌
  ↓
RLS rejects (406 Not Acceptable) ❌
  ↓
setRole(null) ❌
  ↓
Admin link disappears ❌
```

### After (Fixed)
```
Layout renders
  ↓ (server-side, SERVICE_ROLE_KEY)
  role = "admin" ✅
  ↓ (pass to Header)
Header receives initialRole = "admin" ✅
  ↓
useEffect in Header
  ↓
Listen for session changes ONLY ✅
(don't refetch role) ✅
  ↓
Role stays = "admin" ✅
  ↓
Admin link stays visible ✅
  ↓
Page reloads? Layout fetches fresh role from server ✅
```

---

## Key Principle

### Server > Client for Sensitive Data

```
┌─────────────────────────────────────────┐
│ Server Components (Can use SERVICE KEY) │
│ - app/layout.tsx                        │
│ - API Routes (/api/...)                 │
│ - Middleware                            │
│ → Can read ANY profile/ANY data         │
└─────────────────────────────────────────┘
              ↓ pass via props
        ┌─────────────────────────────────┐
        │ Client Components (ANON_KEY)    │
        │ - Header, Footer, etc.          │
        │ → Can read LIMITED data         │
        │ → Trust data from server        │
        │ → DON'T re-fetch protected data │
        └─────────────────────────────────┘
```

---

## Result

✅ No more 406 errors  
✅ Admin link stays visible on reload  
✅ No role state flashing  
✅ Cleaner, simpler code  
✅ Better security (role fetch only on server)

---

## How to Test

1. **Before restart:**
   - Open DevTools → Network tab
   - Open DevTools → Console
   
2. **Log in as admin**
   - Admin link should appear

3. **Hard refresh** (Ctrl+Shift+R)
   - Admin link should STILL be visible
   - Check Network tab → Look for `/profiles` requests
   - You should see ZERO requests to `/profiles` from the browser
   - Check Console → ZERO 406 errors

4. **Navigate around**
   - Go to different pages
   - Admin link should stay visible
   - No 406 errors

If you see ANY `/profiles` requests from the browser, the old code is still running—check for cache issues or make sure the file saved.
