1) Quick website QA checklist — go item by item and mark pass/fail

Use this as your checklist file in the repo or as issues. Triage items by severity.

Core (must-fix now)

 Production site reachable via HTTPS (no mixed content).------------COMPLETE

 No 4xx/5xx errors on key pages (home, services, contact, pricing).

 Env variables present on server and not committed to repo.------------COMPLETE

 Backups + DB dump schedule exists and is tested.

 Deploy preview/staging pipeline exists and mirrors prod env vars (except secrets).

Auth & Supabase integration

 Sign-in, sign-up, sign-out flows work for all roles (test user, admin).

 RLS enforced: test that a normal user cannot access admin tables or other users’ rows.

 Token refresh works (session expiration + refresh).

 Password reset and email verification emails are sent and link works.

API & Data

 All client-facing API endpoints return expected shape + status codes.

 Edge cases: empty responses, long content, malformed requests tested.

 Rate limiting / abuse protections in place for public endpoints.

 DB migrations in repo match live DB schema.

UX / Content

 Homepage hero loads within 1s on 4G simulated throttling.

 CTA buttons visible and click-target ≥ 44px.

 Forms have inline validation and error messages.

 Contact/booking form submissions reach expected email or DB entry.

 Copy has no placeholder text, typos, or lorem ipsum.

Performance

 Lighthouse (Desktop & Mobile) score measured; any score < 50 is urgent.

 Largest Contentful Paint < 2.5s on a decent connection.

 Images served next-gen (AVIF/WebP) and lazy-loaded where appropriate.

 Critical CSS inlined; non-critical loaded async.

Accessibility

 Document has a proper landmark & correct heading order (H1..).

 All images have alt text.

 Keyboard nav works for main flows.

 Color contrast meets WCAG AA.

 Skip-to-content link present.

SEO

 Title, meta description, og:title and og:image set for each page.

 Canonical links correct.

 Sitemap exists and is registered in robots.txt.

 Structured data (schema.org) for local business/services if relevant.

Security

 CSP header set and tested.

 Secure cookies (HttpOnly, Secure, SameSite).

 No sensitive info in JS bundles or public HTML.

 Third-party scripts reviewed and minimized.

 Password reset tokens expire and are single-use.

Monitoring & Observability

 Sentry / error logging configured and verified.

 Uptime/alerts configured for main site.

 Analytics (GA/GA4) or equivalent in place and GDPR-compliant.

Build & Dev hygiene

 CI runs tests and linting on pull requests.

 Branch naming + PR template exists.

 Deploys rollback path tested.

 Build artifacts include source-maps uploaded to Sentry (if used).

Polish / Client-facing

 Pricing and service pages show exact deliverables.

 Portfolio images have captions and alt text.

 Contact CTA and business hours are correct.

 Legal pages (privacy, TOS) exist and are accessible.