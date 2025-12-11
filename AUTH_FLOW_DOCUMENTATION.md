# Authentication Flow Documentation
## AJ247 Studios Website - Complete Auth & Role-Based Access Control

---

## 🔐 Overview

This project implements a secure authentication system using **Supabase Auth** with role-based access control for admin and client routes.

### Key Technologies
- **Next.js 16** (App Router with Server Components)
- **Supabase Auth** (for authentication)
- **Supabase Database** (PostgreSQL with RLS)
- **@supabase/ssr** (for SSR cookie management)

---

## 🔑 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Key Usage:
- **ANON_KEY**: Client-side & session reading (respects RLS)
- **SERVICE_ROLE_KEY**: Admin operations only (bypasses RLS) - **NEVER** expose to client

---

## 📁 File Structure & Responsibilities

### 1. **middleware.ts** (Route Protection)
**Purpose**: Protects `/admin` and `/client` routes before they render

**Flow**:
1. ✅ Creates Supabase client with **ANON_KEY** to read session from cookies
2. ✅ Redirects to `/login` if no session exists
3. ✅ For `/admin` routes: Uses **SERVICE_ROLE_KEY** to check if `role = 'admin'`
4. ✅ Returns updated response with refreshed session cookies

**Why ANON_KEY for session?**
- Service role key bypasses auth and doesn't parse session cookies correctly
- ANON_KEY properly reads and refreshes user sessions

**Critical Fix**:
```typescript
// ✅ CORRECT - Updates both request and response cookies
set: (name, value, options) => {
  req.cookies.set({ name, value, ...options });
  response.cookies.set({ name, value, ...options });
}
```

---

### 2. **app/layout.tsx** (Root Layout)
**Purpose**: Provides initial session & role to Header component

**Flow**:
1. ✅ Reads session with **ANON_KEY** from cookies
2. ✅ If session exists, fetches role using **SERVICE_ROLE_KEY** (bypasses RLS)
3. ✅ Passes `initialSession` and `initialRole` to Header

**Why SERVICE_ROLE_KEY for role?**
- RLS policy allows users to only see their own profile
- Admin client bypasses RLS to safely fetch any user's role
- This only runs server-side, so service key is never exposed

---

### 3. **components/Header.tsx** (Navigation)
**Purpose**: Displays user-specific navigation (shows Admin link only for admins)

**Flow**:
1. ✅ Receives `initialSession` and `initialRole` from server
2. ✅ Uses `onAuthStateChange` to listen for login/logout events
3. ✅ Fetches role dynamically when auth state changes (uses **ANON_KEY**)
4. ✅ Conditionally shows Admin link based on role

**Client-side role fetch**:
```typescript
// Client can only see their own profile (RLS enforced)
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", sess.user.id)
  .single();
```

---

### 4. **utils/supabase-server.ts** (Server Client Helper)
**Purpose**: Creates Supabase client for Server Components & Route Handlers

**Features**:
- ✅ Uses **ANON_KEY** (respects RLS)
- ✅ Full cookie management (get/set/remove)
- ✅ Handles Server Component limitations (set/remove may fail silently)

---

### 5. **utils/supabase-browser.ts** (Browser Client Helper)
**Purpose**: Creates Supabase client for Client Components

**Features**:
- ✅ Uses **ANON_KEY**
- ✅ Automatic cookie handling via `@supabase/ssr`

---

### 6. **lib/supabase-admin.ts** (Admin Client)
**Purpose**: Server-only client for admin operations (bypasses RLS)

**⚠️ Security**:
- **NEVER** import this in Client Components
- Only use in middleware, Server Components, Route Handlers

---

## 🛡️ Database Security (RLS Policies)

### Profiles Table
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
```

**Key Points**:
- ✅ Users can only see their own profile (RLS enforced)
- ✅ Service role key bypasses RLS (used in middleware & layout)
- ✅ Trigger automatically creates profile on user signup

---

## 🔄 Complete Auth Flow

### **User Login Flow**
1. User logs in at `/login`
2. Supabase Auth creates session → stored in cookies
3. Middleware reads session → allows access to protected routes
4. Layout fetches role → passes to Header
5. Header shows appropriate navigation links

### **Admin Access Flow**
1. User navigates to `/admin`
2. Middleware checks session (ANON_KEY)
3. Middleware checks role using admin client (SERVICE_ROLE_KEY)
4. If `role !== 'admin'` → redirect to `/`
5. If admin → proceed to route

### **Session Refresh Flow**
1. Middleware detects expired/expiring session
2. Supabase client auto-refreshes using refresh token
3. Updated cookies written to response
4. Next request uses fresh session

---

## 🐛 Common Issues & Fixes

### ❌ Issue: Users kicked out even when logged in
**Cause**: Middleware using SERVICE_ROLE_KEY to read session  
**Fix**: ✅ Use ANON_KEY in middleware for session reading

### ❌ Issue: Admin link disappears on page reload
**Cause**: Layout not fetching role, or Header not receiving it  
**Fix**: ✅ Layout uses admin client to fetch role, Header receives initialRole

### ❌ Issue: Middleware not updating session cookies
**Cause**: Only setting cookies on `res`, not updating `req`  
**Fix**: ✅ Set cookies on both `req` and `response` objects

### ❌ Issue: RLS prevents role check
**Cause**: Using ANON_KEY to check other users' roles  
**Fix**: ✅ Use SERVICE_ROLE_KEY in server contexts only (middleware, layout)

---

## ✅ Testing Checklist

- [ ] Login redirects to home page
- [ ] `/client` route accessible for any logged-in user
- [ ] `/admin` route accessible only for admin users
- [ ] Non-admin redirected from `/admin` to home
- [ ] Admin link shows in header only for admins
- [ ] Admin link persists after page reload
- [ ] Logout clears session and redirects properly
- [ ] Session refreshes automatically before expiry

---

## 🔒 Security Best Practices

1. ✅ **Never** expose SERVICE_ROLE_KEY to client
2. ✅ Use ANON_KEY for all client-side operations
3. ✅ Use SERVICE_ROLE_KEY only in server contexts (middleware, Server Components, API routes)
4. ✅ Always validate user permissions on server-side
5. ✅ Use RLS policies to enforce database-level security
6. ✅ Log security events for audit trails

---

## 📚 Additional Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side/nextjs)

---

**Last Updated**: December 11, 2025  
**Project**: AJ247 Studios Website  
**Auth System**: Supabase Auth + RLS + Role-Based Access Control
