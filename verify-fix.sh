#!/bin/bash
# Quick verification that the fix is in place

echo "🔍 Verifying authentication fix..."
echo ""

# Check 1: Header.tsx should NOT have fetchRole function
echo "✓ Check 1: Header.tsx - No client-side role fetch"
if grep -q "const fetchRole = async" components/Header.tsx; then
    echo "  ❌ FAIL: fetchRole function still exists"
    exit 1
else
    echo "  ✅ PASS: fetchRole function removed"
fi

# Check 2: Header.tsx should use empty dependency array
echo ""
echo "✓ Check 2: Header.tsx - Dependency array is empty"
if grep -q "}, \[\])" components/Header.tsx; then
    echo "  ✅ PASS: useEffect has empty dependency array"
else
    echo "  ❌ FAIL: useEffect dependency array not empty"
    exit 1
fi

# Check 3: Layout.tsx should have SERVICE_ROLE_KEY
echo ""
echo "✓ Check 3: app/layout.tsx - Uses SERVICE_ROLE_KEY"
if grep -q "SUPABASE_SERVICE_ROLE_KEY" app/layout.tsx; then
    echo "  ✅ PASS: SERVICE_ROLE_KEY is used for role fetch"
else
    echo "  ❌ FAIL: SERVICE_ROLE_KEY not found"
    exit 1
fi

# Check 4: Middleware should use supabaseAdmin
echo ""
echo "✓ Check 4: middleware.ts - Uses supabaseAdmin"
if grep -q "supabaseAdmin" middleware.ts; then
    echo "  ✅ PASS: supabaseAdmin used for role check"
else
    echo "  ❌ FAIL: supabaseAdmin not used"
    exit 1
fi

echo ""
echo "✅ All checks passed! Authentication fix is in place."
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start development server"
echo "2. Log in as an admin user"
echo "3. Verify Admin link appears in header"
echo "4. Refresh the page - Admin link should still be visible"
echo "5. Check browser console - no 406 errors on /profiles"
