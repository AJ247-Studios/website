# Post-Fix Testing Checklist

## What Changed
- **File Modified:** `components/Header.tsx`
- **Change:** Removed client-side role fetching, rely on server-provided role
- **Impact:** Eliminates 406 errors, fixes Admin link flashing

---

## Before You Start Testing

### 1. Clear Browser Cache
- Hard refresh: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac)
- Or: Open DevTools → Settings → Check "Disable cache (while DevTools is open)"

### 2. Verify the Fix is in Place
```bash
# In PowerShell, from the website folder:
# Check that Header.tsx does NOT have fetchRole function
$header = Get-Content components/Header.tsx -Raw
if ($header -like "*const fetchRole*") { 
    Write-Host "❌ Old code still present!" 
} else { 
    Write-Host "✅ Fix confirmed - fetchRole removed" 
}
```

---

## Testing Scenarios

### Scenario 1: Login & Admin Link Visibility

**Setup:**
- Open DevTools (F12)
- Go to Network tab
- Go to Console tab

**Steps:**
1. Navigate to `/login`
2. Log in with an **admin account** (not a regular user)
   - Admin account = user with `role = 'admin'` in profiles table
3. After login, check:
   - [ ] Admin link appears in header
   - [ ] No 406 errors in Console
   - [ ] No `/profiles?...` requests in Network tab (with 406 status)

**Expected Result:**
✅ Admin link visible, no errors

---

### Scenario 2: Page Reload (The Critical Test)

**This is where the old code failed**

**Steps:**
1. While logged in as admin, press **F5** (page refresh)
2. Check:
   - [ ] Admin link is **STILL visible** (not disappeared)
   - [ ] No 406 errors in Console
   - [ ] No `/profiles` requests in Network tab
3. Refresh again with **Ctrl+Shift+R** (hard refresh)
4. Check again:
   - [ ] Admin link is **STILL visible**
   - [ ] No 406 errors

**Expected Result:**
✅ Admin link persists across reloads (this was broken before)

---

### Scenario 3: Navigation to /admin

**Steps:**
1. While logged in as admin, click the Admin link
2. Should navigate to `/admin` page
3. Check:
   - [ ] Page loads successfully
   - [ ] Not redirected back to `/`
   - [ ] No 406 errors in Console
4. Refresh the page while on `/admin`
5. Check:
   - [ ] Still on `/admin` (not kicked out)
   - [ ] Page loads successfully

**Expected Result:**
✅ Can access `/admin` page without being kicked out

---

### Scenario 4: Non-Admin User

**Steps:**
1. Log out (click profile, then logout or navigate to `/login`)
2. Log in with a **regular user account** (role = 'user')
3. Check:
   - [ ] Admin link is NOT visible in header
   - [ ] Can still access `/` and `/portfolio`
4. Try to navigate directly to `/admin`
   - Should be redirected to `/`
   - Check middleware works correctly

**Expected Result:**
✅ Regular users don't see Admin link, can't access `/admin`

---

### Scenario 5: Logout & Login Cycle

**Steps:**
1. Log in as admin
2. [ ] Admin link visible
3. Log out
4. [ ] Admin link disappears
5. Log in again as admin
6. [ ] Admin link reappears

**Expected Result:**
✅ Admin link appears/disappears correctly based on role

---

## Network Tab Checklist

When you complete the above scenarios, the Network tab should show:

**Requests that SHOULD exist:**
- [ ] `/` (page loads)
- [ ] `/api/auth/...` (auth endpoint calls)
- [ ] `/login` or `/signup` (auth pages)
- [ ] CSS/JS bundles
- [ ] Images and other assets

**Requests that SHOULD NOT exist:**
- [ ] ❌ `/profiles?...` (with any query parameters) - should be ZERO
- [ ] ❌ Any 406 responses
- [ ] ❌ Any 401/403 responses (unless intentional, like accessing `/admin` as non-admin)

If you see `/profiles` requests, the old client-side fetch code is still running. Clear cache and restart dev server.

---

## Console Checklist

When you complete the above scenarios, the Console should show:

**Errors that SHOULD NOT exist:**
- ❌ `Failed to load resource: ... 406`
- ❌ `Multiple GoTrueClient instances detected`
- ❌ `Error fetching role:`
- ❌ Any Supabase RLS violation errors

**What CAN appear (normal):**
- ✅ Normal logs from your app
- ✅ Warnings from libraries
- ✅ Auth state change logs (if you added them)

---

## If Something's Still Broken

### 406 Still Appearing?
1. **Hard refresh browser cache:**
   - Ctrl+Shift+R (Windows)
   - Close DevTools and reopen
2. **Check the file was saved:**
   ```bash
   # In PowerShell:
   (Get-Content components/Header.tsx) | Select-String -Pattern "const fetchRole"
   # Should return nothing
   ```
3. **Restart dev server:**
   ```bash
   # Ctrl+C to stop
   npm run dev
   ```

### Admin Link Still Disappears on Reload?
1. **Check user is actually admin:**
   - Open Supabase dashboard
   - Go to Database → profiles
   - Search for your user ID
   - Check that `role` column shows `'admin'`

2. **Check layout.tsx is being used:**
   - `app/layout.tsx` should have role fetch code
   - Make sure it hasn't been accidentally deleted

### Getting Kicked Out of /admin?
1. **Check middleware.ts:**
   - Should use `supabaseAdmin` (SERVICE_ROLE_KEY)
   - Should check `profile.role === "admin"`

2. **Check browser is storing session:**
   - Open DevTools → Application → Cookies
   - Look for `sb-*-auth-token` cookie
   - If missing, session isn't being saved

---

## Success Criteria

You'll know the fix is working when:

1. ✅ You can log in as admin
2. ✅ Admin link appears in header
3. ✅ Admin link stays visible after page reload
4. ✅ You can navigate to `/admin` and stay there
5. ✅ No 406 errors in console
6. ✅ No `/profiles` requests in network tab from browser
7. ✅ Non-admin users don't see the Admin link
8. ✅ Logging out removes the Admin link

**If ALL of the above are true → Fix is successful! 🎉**

---

## Still Having Issues?

Check these in order:

1. **Is your admin user profile created?**
   ```sql
   -- Run in Supabase SQL Editor
   SELECT id, role FROM profiles WHERE id = '<your-user-uuid>';
   ```
   Should return: `user-uuid | admin`

2. **Is your user actually logged in?**
   - DevTools → Application → Cookies
   - Look for `sb-*-auth-token` cookie
   - Should be present and non-empty

3. **Is the app using the right environment variables?**
   ```bash
   # Check .env.local exists with:
   # NEXT_PUBLIC_SUPABASE_URL=...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   # SUPABASE_SERVICE_ROLE_KEY=...
   ```

4. **Did you clear the Next.js build cache?**
   ```bash
   rm -r .next
   npm run dev
   ```

If none of the above work, document:
- What you did
- What you expected
- What happened instead
- Any error messages in console
- Screenshots of Network tab

Then we can debug further!
