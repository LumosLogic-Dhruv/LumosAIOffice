# DocuFlow AI — Remaining Tasks

**Last Updated:** July 6, 2026
**Status:** Post-audit implementation complete. Items below are what remains.

---

## Priority 1 — Must Fix Before Public Launch

| # | Task | Area | Notes |
|---|---|---|---|
| **M1** | **Rotate all production secrets** | Security | `JWT_SECRET`, `CLOUDINARY_API_SECRET`, `GROQ_API_KEY`, `GEMINI_API_KEY`, `ADMIN_SECRET` in `ai-service/.env` must be rotated. Migrate secrets to Google Secret Manager for Cloud Run. Update GitHub Actions secrets for CI/CD. |
| **M2** | **Billing / Subscription system** | Revenue | No payment integration. No usage tiers. No limits on AI calls. Every user has unlimited access. Recommended: Razorpay (India) for INR + UPI. Add plan limits to AI endpoints. |
| **M3** | **True server-side Convex pagination** | Performance | Convex `documents:list`, `clients:list`, `catalog:list` still fetch all records. UI shows 20/page but all data loads into memory. Add cursor-based pagination in Convex queries. |
| **M4** | **CSV export for Clients and Catalog** | Feature | Documents page has CSV export. Clients and Catalog pages do not. Users cannot export their client list or product catalog. |

---

## Priority 2 — High Business Impact

| # | Task | Area | Notes |
|---|---|---|---|
| **H1** | **React Query / TanStack Query** | Performance | All data fetches use raw `useEffect` + axios. Every page mount re-fetches everything. React Query adds caching, background refresh, and deduplication. Estimated: 2 days. |
| **H2** | **Audit log CSV export** | Feature | Activity logs exist and are viewable by admins in Team page. No way to export them. Add a "Download CSV" button on the Team page activity log section. |
| **H3** | **Onboarding checklist** | UX | driver.js tour fires once but no persistent checklist. Add a checklist card on Dashboard: "Add logo ✓, Create first document ✓, Invite team member ✓". Dismiss when complete. |
| **H4** | **In-app notifications** | UX | No notification bell. Users have no in-app alerts for: e-signature received, document viewed by client, team member joined. Add a notification center in the Layout header. |
| **H5** | **Confirmation modals for Clients and Catalog deletes** | UX | Clients and Catalog delete directly without a custom confirmation dialog (uses browser `confirm()` or immediate delete). Documents page has a proper modal — apply same pattern to Clients and Catalog. |
| **H6** | **"Member joined" email notification** | UX | When someone joins via invite link, the admin receives no notification. Add email to the `POST /api/auth/register` flow when `inviteCode` is used. |

---

## Priority 3 — Enhancements

| # | Task | Area | Notes |
|---|---|---|---|
| **E1** | **Skeleton loaders on data pages** | UX | Documents, Clients, Catalog show a spinner while loading. Replace with skeleton placeholders (grey animated cards) as used in Notion, Linear. |
| **E2** | **Breadcrumbs** | UX | DocumentPreview, DocumentHistory, and Team pages have no breadcrumb trail. Users rely on browser back button. |
| **E3** | **Inline form validation on remaining pages** | UX | react-hook-form + zod added to Login, Register, Clients, Catalog. Still missing: ForgotPassword, ResetPassword, CompanyProfile, Team invite form. |
| **E4** | **BUG-03: Register invite code UX** | Bug | When an invalid invite code is submitted, the form shows an error but stays in "join team" mode. There is no way to switch back to "create new company" mode without manually editing the URL. |
| **E5** | **BUG-07: Activity logs cleanup** | Bug | `activityLogs` Convex table grows unbounded. The query caps at 100 but never deletes old records. Add a cleanup mutation that removes logs older than 90 days, triggered on each write. |
| **E6** | **Keyboard shortcuts** | UX | Cmd+K search is done. Still missing: Cmd+N (New Document), Cmd+S (Save in edit mode), Escape (close modals). |
| **E7** | **GSAP + Framer Motion on LandingPage** | Performance | Both animation libraries are loaded on LandingPage.tsx (~100KB combined). Remove one — keep Framer Motion (already used elsewhere) and replace GSAP calls. |
| **E8** | **Replace iframe PDF preview with react-pdf** | UX/Mobile | PDF view uses an `<iframe>` which breaks on mobile and some corporate browsers. Replace with `react-pdf` component for reliable in-browser rendering. |
| **E9** | **Mobile-optimized document editor** | UX | DocumentPreview and DocumentHistory are not usable on mobile. The AI sidebar, table editing, and section inputs require a responsive redesign for small screens. |
| **E10** | **Share link expiry UI in DocumentPreview** | UX | Backend supports `expiresInDays` on share endpoint. The frontend share button copies the link but doesn't show a UI to set expiry (e.g., "Expires in 7 days" toggle). |

---

## Security — Remaining Gaps

| # | Finding | Severity | Notes |
|---|---|---|---|
| **S1** | JWT stored in localStorage (XSS risk) | High | Tokens still stored in `localStorage`. Full mitigation requires migrating to `httpOnly` cookies + refresh token pattern. This is a significant auth refactor. |
| **S2** | No CSRF protection | Medium | Not using cookies currently, so risk is lower. If S1 is implemented, CSRF protection via `SameSite=Strict` or double-submit cookie must be added simultaneously. |
| **S3** | E-signature has no identity verification | Low | Signer types their own name and contact — no OTP or Aadhaar verification. Not legally binding in India without verified identity. Add phone OTP verification on the signing page. |

---

## Nice to Have — Future Roadmap

| # | Feature | Notes |
|---|---|---|
| **N1** | Template Library | Save and reuse document structures. "My Templates" section. |
| **N2** | Document Comments / Annotations | Inline comments on document sections for team review. |
| **N3** | Multi-language document generation | AI generates in Hindi, Gujarati, etc. based on user preference. |
| **N4** | WhatsApp notifications | Send share links directly via WhatsApp using Twilio/WATI. |
| **N5** | OCR / PDF Import | Upload a PDF or image → AI extracts data into an editable document. |
| **N6** | Payment tracking on invoices | Mark invoices as Paid / Unpaid / Overdue. Payment date field. |
| **N7** | Dashboard analytics charts | Documents created per month, type breakdown trends, conversion rates. |
| **N8** | Zapier / Webhook integration | Trigger external CRM actions when documents are created or signed. |
| **N9** | Custom domain for share links | Replace Firebase URL with `docs.yourcompany.com` for share links. |
| **N10** | Mobile app / PWA | Progressive Web App manifest + offline support. |
| **N11** | AI tone/style options | "Make this more formal", "Convert to Hindi", "Use casual tone" presets. |
| **N12** | Signature certificate PDF | Generate a legally-formatted certificate PDF showing signature + audit trail. |
| **N13** | Reminders for unsigned documents | Automated follow-up emails if a share link hasn't been signed in X days. |
| **N14** | Team-level roles | Viewer role (read-only), Editor role (edit but not delete), per-document role override. |
| **N15** | Client Portal | Dedicated login-free portal where clients see all documents sent to them. |
| **N16** | Dark mode | System-aware dark/light theme toggle. |
| **N17** | Onboarding video / interactive demo | Embedded Loom or interactive walkthrough for new users. |

---

## Test Coverage — What Exists vs What's Needed

### Exists
- `frontend/src/tests/auth.test.ts` — 4 unit tests for `optimizeCloudinaryUrl`
- `ai-service/tests/test_health.py` — 1 health check test
- `frontend/vitest.config.ts` — test runner configured

### Still Needed
| Type | What to Write |
|---|---|
| Frontend unit tests | AuthContext (session timeout logic), form validation schemas (zod), utility functions |
| Frontend integration tests | Login flow, Register flow, Document create flow |
| Backend unit tests (Pytest) | `_validate_ai_input()`, `_token()`, password hashing |
| Backend integration tests | Auth endpoints (register, login, forgot-password), document CRUD |
| E2E tests (Playwright) | Full user journey: register → verify → create doc → share → sign |

---

## Scores — Updated After Implementation

| Category | Before Audit | After Implementation |
|---|---|---|
| Authentication & Security | 20/100 | **72/100** |
| Core Feature Completeness | 55/100 | **78/100** |
| Data Integrity & Validation | 30/100 | **68/100** |
| Error Handling | 40/100 | **55/100** |
| Testing Coverage | 0/100 | **12/100** |
| Infrastructure | 50/100 | **80/100** |
| Legal Compliance | 35/100 | **55/100** |
| Documentation | 30/100 | **60/100** |
| Monitoring & Observability | 10/100 | **20/100** |
| Mobile Responsiveness | 45/100 | **45/100** |

| Score | Before | After |
|---|---|---|
| **Production Readiness** | 32/100 | **60/100** |
| **QA Readiness** | 6/100 | **18/100** |
| **Overall Product Maturity** | 34/100 | **62/100** |

---

*This file tracks only what remains. For the full original audit, see `PRODUCT_AUDIT_REPORT.md`.*
