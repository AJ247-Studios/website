# AJ247 Studios — Website: Full Specification & RBAC

> Complete product spec: roles, permissions, data models, API endpoints, UI flows, admin tools, acceptance criteria, and prioritized MVP roadmap.

---

## 1. Purpose & Scope
This document describes the current website architecture, all capabilities, and exact privileges for each user type: **Guest**, **Client**, **Team Member**, and **Admin** (future roles: **Vendor**, etc.). It is written to be a developer-facing product spec and a checklist for building the MVP and next phases.

Target audience: developers (frontend/backend), product owner (you), and business stakeholders.

---

## 2. High-level capabilities
- Public portfolio pages (galleries, project pages, highlight reels)
- Client signup, quotes/booking, subscription & invoices
- Media upload, delivery, and galleries (clients & public)
- Secure, role-based dashboard for Clients, Team Members, and Admins
- In-app chat / Q&A (GPT-powered or simple messaging)
- File storage, transcoding, thumbnails, watermarks
- Billing (one-off payments, subscriptions, invoices)
- Team collaboration: assign tasks, mark deliverables, approve proofs
- Audit logs and activity feed for compliance and accountability

---

## 3. Roles & Permissions (RBAC)
**Roles:**
- `Admin` — full control (manage users/roles, billing, site content, settings)
- `Team Member` — content creation and project work (upload assets, edit project pages, view assigned client projects)
- `Client` — view and approve work, purchase services, upload client assets, message team
- `Guest` — browse public content, request quote, limited chat

> Permission principle: always deny by default; grant only specific capabilities per role.

### Permissions matrix (selected, developer-friendly)
- Manage Users: Admin only
- Invite Users: Admin -> Team Member; Team Member can invite Clients (by email) for projects they own
- View All Projects: Admin; Team Member only for assigned projects; Client only for their projects
- Create Projects: Admin & Team Member (Team Member creates under Client or internal)
- Upload Media: Team Member (assigned projects), Client (their projects), Admin
- Edit Public Pages/Portfolio: Admin only (or Admin + delegated editor role later)
- Manage Billing / View Payments: Admin; Client views their invoices/payments
- Generate Download Links: Admin & Team Member (for client delivery); Client only for their delivered assets
- Approve Deliverables: Client; Admin can override
- Access API keys / secrets: Admin only
- Chat access: Guests (limited), Client (full), Team Member & Admin (full)

---

## 4. User stories & flows (by role)
### Guest
- Browse portfolio and public galleries
- Request a quote (submit form -> creates lead record)
- Start a limited chat (3 messages -> prompt to login/signup)
- View public pricing page

### Client
- Sign up / accept invitation via email
- See client dashboard: upcoming shoots, invoices, active projects
- Pay invoices (Stripe) and save payment method
- Upload assets, annotations, and comments for revisions
- Approve final deliverables and request changes
- Download high-res delivered files (expiring links)
- Chat with team (persistent conversation per project)

### Team Member
- Sign up via invite (email link)
- See assigned projects and deadlines
- Upload raw/edited media with metadata (tags, focal length, credits)
- Create project galleries (private or public), mark deliverable status
- Add time logs, expenses (optional)
- Request client approval, send notifications

### Admin
- Manage users, teams, roles
- Global settings (site content, payment details, tax, default deliverable settings)
- Billing admin: create manual invoices, issue refunds, view revenue dashboard
- Manage public portfolio, featured projects, hero banners
- View audit logs and change history
- Configure integrations (Stripe, storage, CDN, GPT/chat service keys)

---

## 5. Data model (core entities)
Summary fields only — developer should expand in DB schema.

### User
- id (uuid)
- email (unique)
- name
- role (enum)
- avatar_url
- invited_by (user id)
- last_login_at
- created_at
- metadata (JSON for prefs)

### Project
- id
- title
- client_id (user)
- description
- status (lead, booked, in_progress, review, delivered, archived)
- assigned_team_members [user ids]
- scheduled_date(s)
- location
- created_at, updated_at

### MediaAsset
- id
- project_id
- uploaded_by (user)
- filename, mime_type
- storage_path / url
- type (photo, video, raw, edited, deliverable)
- duration, resolution, size
- thumbnails (array urls)
- watermarked_url (optional)
- metadata (exif, tags, focal_length)
- created_at

### Gallery / PublicPage
- id
- title
- description
- visibility (public, client-only, team-only)
- assets_order [media ids]
- slug

### Invoice
- id
- client_id
- project_id (optional)
- amount_cents
- currency
- status (draft, sent, paid, overdue, refunded)
- due_date
- stripe_invoice_id

### ChatSession (optional GPT-enhanced)
- id
- project_id (optional)
- participants [user ids + guest session id]
- messages [{from, text, timestamp, system_flags}]

### AuditLog
- id
- actor_id
- action_type
- target_type, target_id
- details (json)
- timestamp

---

## 6. API endpoints (examples)
REST-style endpoints — adapt to GraphQL if preferred.

**Auth**
- `POST /auth/signup` (email, password) or invite flow
- `POST /auth/login`
- `POST /auth/forgot-password`
- `POST /auth/invite/accept` (token)

**Users**
- `GET /users/me`
- `GET /users/:id` (admin only)
- `POST /users/invite` (admin or team member depending on policy)
- `PATCH /users/:id` (profile updates)

**Projects**
- `GET /projects` (filter by role)
- `POST /projects`
- `GET /projects/:id`
- `PATCH /projects/:id`

**Media**
- `POST /projects/:id/assets` (multipart upload, or presigned URL workflow)
- `GET /assets/:id` (returns metadata + signed url)
- `GET /projects/:id/gallery` (ordered assets)
- `POST /assets/:id/transcode` (admin/team only)

**Billing**
- `POST /invoices` (admin)
- `GET /invoices/:id`
- `POST /payments/charge` (client)
- Webhook: `POST /webhooks/stripe` (payment events)

**Chat**
- `GET /projects/:id/chat`
- `POST /projects/:id/chat/messages`

**Admin**
- `GET /admin/users`
- `GET /admin/audit-logs`
- `PATCH /admin/settings`

---

## 7. Frontend screens & UX flows (MVP focus)
**Public**
- Home / hero / featured projects
- Portfolio / galleries (filter by service: sport, event, commercial)
- Pricing & packages page
- Quote request form

**Auth flows**
- Invite link -> accept -> create password -> onboard wizard (upload logo, company info)
- Email/password login (option: magic link)

**Client Dashboard (MVP)**
- Overview: active projects, unpaid invoices, recent messages
- Project view: timeline, media gallery, approvals, chat panel
- Billing: invoices list + pay now

**Team Dashboard (MVP)**
- Assigned projects list with due dates
- Upload UI: drag & drop, tagging, auto-thumbnail generation
- Delivery flow: select assets -> package -> deliver -> notify client

**Admin Dashboard**
- Site metrics (revenue this period, active clients, open requests)
- User management UI
- Content editor for public pages

---

## 8. Media handling & storage strategy
- Use presigned upload URLs (S3 / S3-compatible or Cloudflare R2) to avoid large file proxying.
- Generate thumbnails and low-res proxies on upload (serverless worker / job queue)
- Store EXIF and custom metadata in DB separate from file storage
- Deliver via CDN with signed, expiring URLs for client downloads
- Optional: automatic watermarking for preview assets
- For video: transcode to H264/HEVC web-friendly variants and generate poster image

Limits and defaults (MVP): max 5GB per upload, image max 80MB; consider chunked uploads for reliability.

---

## 9. Billing & payments
- Use Stripe (recommended) for payments, subscriptions, and invoices.
- Webhook processing for settled payments -> update Invoice.status
- Admin interface for manual invoicing and refunds
- Taxes: store tax_number on Client profile and optionally add tax calculation

---

## 10. Security & compliance
- Auth: recommended Supabase/Auth0/Clerk for managed auth. Support invite tokens and magic links.
- Use HTTPS everywhere and secure cookies (httpOnly, secure, SameSite)
- Role-based access checks on every API endpoint (server-side)
- Rate-limit public endpoints (quote form, chat) to reduce abuse
- GDPR: provide data export & delete for client accounts; cookie & privacy policy pages
- Backups: regular DB backups and snapshotting for file storage

---

## 11. Notifications & emails
- Transactional emails: invite, password reset, invoice sent, delivery ready
- In-app notifications and email digests (configurable) for comments and approvals
- SMS optional for urgent notifications (Twilio)

---

## 12. Analytics & monitoring
- Track key events: new lead, booked project, invoice paid, deliverable approved
- Monitor error rates, background job queues, storage costs
- Use simple dashboards (Admin) and exportable CSVs for accounting

---

## 13. Acceptance criteria & QA checklist (per feature)
- Auth: invite acceptance must create user and link projects correctly
- Uploads: files upload via presigned URL; thumbnails generated within 60s
- Delivery: client receives email + in-app notification; download link valid for configured period
- Billing: paid invoices change status and mark project as paid where appropriate
- Permissions: Team Member cannot access other clients' projects unless assigned

---

## 14. MVP roadmap (priority order)
**Sprint 0 — Setup**
- Project repo, infra, CI, env management
- Basic auth & RBAC
- Storage bucket + presigned upload flow

**Sprint 1 — Core user experiences (2 weeks)**
- Client signup/invite, dashboard, project CRUD
- Media upload, thumbnail generation, gallery view
- Delivery flow + client approvals

**Sprint 2 — Billing + team flows (2 weeks)**
- Stripe integration, invoices, webhooks
- Team member invite & assignment, basic admin
- Notifications

**Sprint 3 — Polish + Chat + Public site (2 weeks)**
- Public portfolio pages, SEO-friendly slugs
- In-app chat, small GPT assistant (if wanted)
- Audit logs, analytics, GDPR features

---

## 15. Tech stack recommendations (fast, cost-effective MVP)
- Frontend: Next.js (React) or Remix on Vercel for fast deployment
- Backend: Supabase (auth + Postgres + storage) or Node.js + Postgres on a managed DB
- Storage: S3 or Cloudflare R2 + CDN
- Payments: Stripe
- Background jobs: serverless functions (Vercel workers) or a small managed worker queue
- Image/video processing: Lambda / Cloud Run or third-party services (Cloudinary for faster MVP)

---

## 16. Operational checklist before launch
- Configure Stripe account and webhook endpoints
- Set up storage buckets & CDN, ensure CORS rules correct for presigned uploads
- Create admin user, seed test data, and run QA flows
- Setup monitoring & alerts (errors, job failures)
- Write privacy/cookie policy and terms of service pages

---

## 17. Next concrete deliverables (what I will produce for you next)
1. DB schema (Postgres) + migrations for MVP
2. API route list with request/response schemas
3. Minimal frontend page wireframes (client dashboard, upload flow, gallery)

---

## 18. Misc notes & edge cases
- If social media is limited for you (per your constraints), supplier-collaboration flows must prefer email or WhatsApp notifications and downloadable packages.
- Consider an "offline delivery" option where admin uploads a ZIP and we send an expiring download link.
- For GDPR, implement a data retention policy (eg 3 years by default) and make it configurable.

---

*Document authored for AJ247 Studios — keep this spec as living documentation. Update when adding Vendor or other roles.*

