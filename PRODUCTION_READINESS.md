# Production Readiness Checklist

Prioritized list of the most important remaining work to make this app production-ready (top-notch). Use this as a roadmap; you can go through and explain each item as needed.

---

## Critical (must-have before production)

### 1. **Error handling & resilience**
- **Error boundaries:** No `error.tsx` or `global-error.tsx` in the app. Add route-level and root-level error boundaries so runtime errors don’t white-screen the app; show a fallback UI and optionally report errors.
- **API error handling:** Ensure all API routes use try/catch and return consistent JSON (you have `api-response` helpers; verify no uncaught exceptions and that 5xx responses don’t leak stack traces in production).
- **Global error page:** Add `app/global-error.tsx` for top-level failures (required for Next.js App Router).

### 2. **Security**
- **Webhook secret:** `app/api/auth/webhook/route.ts` uses `process.env.CLERK_WEBHOOK_SECRET || ''`. In production, fail fast if `CLERK_WEBHOOK_SECRET` is missing (don’t default to empty string).
- **Debug endpoint:** `app/api/test-user-creation/route.ts` is a debug endpoint (logs user/sync details). Disable it in production (e.g. only allow when `NODE_ENV !== 'production'` or remove/guard by feature flag).
- **Env validation:** Add startup validation for required env vars (`DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, etc.) so the app fails fast with a clear message instead of failing at runtime.

### 3. **API request safety**
- **Payload limits:** Many routes use `request.json()` with no explicit size limit. Consider enforcing a body size limit (e.g. in middleware or per-route) to avoid DoS via huge payloads.
- **rootNode validation:** Layout PATCH accepts `rootNode` as `z.record(z.unknown(), z.unknown())` with no depth/node limit. Reuse or mirror SDUI validation (e.g. max depth, max nodes) for `rootNode` to prevent abuse and keep storage/rendering safe.

### 4. **Logging & observability**
- **Console usage:** There are many `console.log`/`console.error` calls in `app/` and `app/api/`. In production, use a proper logger (or strip/guard logs by env) so you don’t leak sensitive data and can control log level and format.
- **Structured logging:** Consider a small logging utility that adds request id, user id (when safe), and level, and forwards to your monitoring (e.g. Vercel Logs, Datadog, Sentry).

---

## High priority (strongly recommended)

### 5. **Environment & deployment**
- **`.env.example`:** Add a `.env.example` (no secrets) listing all required and optional env vars (e.g. `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`) so deployers know what to set.
- **Build & start:** Verify `pnpm build` and `pnpm start` work and that no dev-only code paths break production (e.g. Prisma logging is already gated by `NODE_ENV` in `lib/db.ts` – good).

### 6. **Auth & middleware**
- **Clerk + API consistency:** Middleware protects pages; API routes use `authenticateRequest` (Clerk session or API key). Ensure every mutation/read that should be private is behind `requireAuth` or `requireAdmin`; no accidental public write endpoints.
- **Session handling:** Confirm redirects after login/signup and token refresh behave correctly in production (same-site, HTTPS, cookie settings).

### 7. **Data & validation**
- **Layout save payload:** You already validate `sduiJson` with `validateSduiJson` when provided. Extend or duplicate similar limits (depth, node count, key size) for `rootNode` on PATCH so both formats are safe.
- **Input sanitization:** Zod is used for shape validation; ensure any user-facing strings (e.g. layout names, screen names) are sanitized or length-limited where they’re stored or reflected (XSS, DB bloat).

### 8. **User experience**
- **Loading states:** Critical flows (editor load, project list, layout switch, save, publish) should show clear loading/disabled states so users don’t double-submit or think the app is stuck.
- **Empty states:** List pages (projects, layouts, screens) should have explicit empty states and clear CTAs (e.g. “Create your first project”).
- **Toasts / feedback:** Replace or complement `alert()` for success/error (e.g. Publish success) with in-app toasts so the experience is consistent and non-blocking.

---

## Medium priority (production polish)

### 9. **Testing**
- **No app tests:** There are no `*.test.ts`/`*.spec.ts` files in the app (only in node_modules). Add a few critical path tests: e.g. API auth middleware, layout create/update (with ownership), and optionally a smoke test for the public screens API (`/api/v1/screens/[screenName]`).
- **E2E:** Consider a minimal Playwright (or similar) flow: login → create project → open editor → save layout, to guard regressions.

### 10. **Performance**
- **Editor bundle:** Editor page uses Monaco and heavy builder UI; confirm code-splitting and lazy loading so the rest of the app stays fast.
- **API response size:** For project/layout lists, ensure responses are paginated or bounded so large accounts don’t get huge JSON payloads.

### 11. **Documentation & ops**
- **README:** Document how to run locally (env, `pnpm install`, `pnpm db:push` or `db:migrate`), how to build/start, and which env vars are required.
- **Runbook:** Short runbook for common production issues (e.g. “Layout not saving” → check DB, API errors, Clerk webhook delivery).

---

## Lower priority (nice-to-have)

### 12. **Rate limiting**
- Add rate limiting (e.g. on `/api/auth/login`, `/api/auth/register`, and write APIs) to reduce abuse and brute force. Can be done at edge (Vercel) or in API routes.

### 13. **Monitoring & alerts**
- Integrate error tracking (e.g. Sentry) and optionally APM; set alerts on 5xx spike or failed webhooks.

### 14. **Accessibility & SEO**
- Audit critical pages (landing, login, dashboard) for a11y (focus, labels, contrast); add meta tags for public pages if SEO matters.

---

## Summary table

| Area              | Priority   | Status / Action                                      |
|-------------------|-----------|------------------------------------------------------|
| Error boundaries  | Critical  | Missing – add `error.tsx`, `global-error.tsx`        |
| Webhook secret    | Critical  | Fix empty fallback – require in prod                 |
| Test endpoint     | Critical  | Disable or guard in production                       |
| Env validation    | Critical  | Add startup check for required vars                 |
| Payload / rootNode| Critical  | Size limits + rootNode depth/nodes validation        |
| Logging           | Critical  | Replace ad-hoc console with env-aware logger        |
| .env.example      | High      | Add and document vars                               |
| Auth coverage     | High      | Audit all API routes for requireAuth/requireAdmin   |
| Loading/empty UX   | High      | Consistent loading and empty states                 |
| Testing           | Medium    | Add critical API + optional E2E                      |
| Rate limiting     | Lower     | Optional for launch                                 |

---

You can use this list in order (Critical → High → Medium) and expand on any item when you “go and explain” to your team or stakeholders.
