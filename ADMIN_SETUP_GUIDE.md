# 🚀 Quick Start - Admin Setup & Testing

## Step 1: Verify Environment Variables

Ensure your `.env.local` has these values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get these from: **Supabase Dashboard → Project Settings → API**

---

## Step 2: Run Database Migration

Copy the entire contents of `supabase/migrations/create_profiles_table.sql` and run it in:

**Supabase Dashboard → SQL Editor → New Query**

This creates:
- ✅ `profiles` table with `role` column
- ✅ RLS policies (users can only see their own profile)
- ✅ Trigger to auto-create profile on signup
- ✅ Index for faster role queries

---

## Step 3: Make Yourself Admin

### Option A: Via Supabase Dashboard

1. Go to **Supabase Dashboard → Authentication → Users**
2. Find your user and copy the UUID
3. Go to **Table Editor → profiles**
4. Find your profile row (or create it)
5. Set `role` to `admin`

### Option B: Via SQL

```sql
-- First, get your user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Then, set yourself as admin (use the ID from above)
INSERT INTO profiles (id, role) 
VALUES ('your-user-id-uuid-here', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
```

Run this in **SQL Editor**.

---

## Step 4: Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Step 5: Test Authentication Flow

### Test 1: Regular User Access
1. ✅ Sign up with a new account
2. ✅ Check that profile is auto-created with `role = 'user'`
3. ✅ Verify you can access `/client`
4. ❌ Verify you CANNOT access `/admin` (redirects to home)
5. ❌ Verify you do NOT see "Admin" link in header

### Test 2: Admin Access
1. ✅ Login with your admin account
2. ✅ Verify you see "Admin" link in header
3. ✅ Click Admin link → should load `/admin` successfully
4. ✅ Reload the page → Admin link should persist
5. ✅ Check browser console → no auth errors

### Test 3: Session Persistence
1. ✅ Login as admin
2. ✅ Navigate to `/admin`
3. ✅ Reload the page (F5)
4. ✅ You should stay on `/admin` (not redirected)
5. ✅ Admin link should still show in header

### Test 4: Logout & Re-login
1. ✅ Logout (implement logout in your profile page)
2. ✅ Verify redirect to home/login
3. ✅ Login again as admin
4. ✅ Verify Admin link reappears
5. ✅ Verify `/admin` is accessible again

---

## Step 6: Verify Database RLS

Test that RLS is working correctly:

```sql
-- As a regular user (using ANON_KEY in browser):
SELECT * FROM profiles;
-- Should only return YOUR profile

-- As admin in SQL Editor (bypass RLS):
SELECT * FROM profiles;
-- Should return ALL profiles
```

---

## Common Issues & Solutions

### ❌ Issue: "Not authorized" when accessing /admin
**Fix**: Run the SQL command from Step 3 to set your role to 'admin'

### ❌ Issue: Admin link doesn't show after login
**Fix**: 
1. Check browser console for errors
2. Verify your `profiles` table has your user with `role = 'admin'`
3. Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)

### ❌ Issue: Redirected from /admin even as admin
**Fix**:
1. Check Supabase logs: Dashboard → Logs → API
2. Verify SERVICE_ROLE_KEY in .env.local is correct
3. Check middleware console logs for error messages

### ❌ Issue: Session lost on page reload
**Fix**: 
- This should now be fixed! If still happening:
  1. Clear all cookies for localhost
  2. Clear browser cache
  3. Re-login and test

---

## Debugging Tips

### Check User Session
```typescript
// In any Client Component:
const supabase = createClientBrowser();
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
```

### Check User Role
```typescript
// In any Client Component (logged in):
const supabase = createClientBrowser();
const { data: profile } = await supabase
  .from("profiles")
  .select("role")
  .eq("id", session.user.id)
  .single();
console.log('My role:', profile?.role);
```

### Monitor Middleware
Middleware already has console.error for auth failures. Check your terminal/Vercel logs for:
```
[Middleware] Admin access denied: { userId: '...', error: '...', role: '...' }
```

---

## Production Deployment Checklist

Before deploying to Vercel/production:

- [ ] `.env.local` variables are set in Vercel Environment Variables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is marked as "Sensitive" in Vercel
- [ ] Database migrations are run on production Supabase instance
- [ ] At least one admin user is created in production
- [ ] Test login/logout in production
- [ ] Test `/admin` and `/client` routes in production
- [ ] Verify no service role key leaks in browser Network tab

---

## Additional Resources

- 📖 **AUTH_FLOW_DOCUMENTATION.md** - Complete technical documentation
- 📋 **AUTH_FIXES_SUMMARY.md** - What was fixed and why
- 🗃️ **supabase/migrations/** - Database schema and RLS policies

---

**Need Help?**
- Check the documentation files above
- Review Supabase Dashboard → Logs
- Check browser console for client-side errors
- Check terminal/Vercel logs for server-side errors

✅ **System is ready for production!**
