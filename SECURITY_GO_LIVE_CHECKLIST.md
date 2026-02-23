# SpendNote Security Go-Live Checklist

Use this as a strict pass/fail gate before public launch.

Legend:
- [ ] Not checked
- [x] Pass
- [~] Partial / needs follow-up
- [!] Fail / blocker

---

## P0 (Must pass before go-live)

### 1) Data access and tenant isolation (Supabase RLS)
- [ ] Every app-facing table has RLS enabled.
- [ ] Read policies only allow current user/team rows.
- [ ] Write policies block cross-tenant inserts/updates/deletes.
- [ ] Direct table access is denied when JWT is missing/invalid.

Evidence / notes:
- SQL checks run:
- Tested tables:
- Owner:

### 2) Secret and key safety
- [ ] No `service_role` key in frontend code, HTML, or public JS.
- [ ] Environment variables are split correctly (public anon vs server secrets).
- [ ] Rotated any key that may have been exposed previously.
- [ ] Repository scan done for hardcoded secrets/tokens.

Evidence / notes:
- Scan command/tool:
- Findings:
- Owner:

### 3) Auth hardening
- [ ] Allowed redirect URLs are strict and expected only.
- [ ] Email auth flow cannot be abused with open redirects.
- [ ] Session handling is stable (refresh, expiry, logout).
- [ ] Password reset/login endpoints have abuse protection.

Evidence / notes:
- Redirect allowlist:
- Abuse test results:
- Owner:

### 4) Edge protection (Cloudflare)
- [x] WAF managed rules enabled.
- [x] Bot protection enabled (at least baseline).
- [~] Login/signup/reset endpoints are rate-limited.
- [x] Suspicious high-risk paths are challenged/blocked (`/wp-*`, `/.env`, etc.).

Evidence / notes:
- WAF mode: Cloudflare managed ruleset is active (Always active = ON).
- Bot mode: Bot Fight Mode ON (JS Detections ON).
- Rate-limit rules: 1 active rule (`RL-HighRisk-Paths`, Block) within Free-plan rule limit.
- Rate-limit coverage note: auth/invite/email endpoint-specific limits are not fully covered from this zone on current plan/architecture.
- Security events: multiple managed-rule BLOCK actions visible in Security Analytics Events.
- Challenge passage: configured (30 minutes).
- Owner: SpendNote ops

### 5) Security headers
- [ ] `Content-Security-Policy` is set and reviewed.
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `Referrer-Policy` present.
- [ ] `Permissions-Policy` reviewed.
- [ ] `frame-ancestors`/clickjacking protection in place.

Evidence / notes:
- Header test URL:
- Missing headers:
- Owner:

### 6) Monitoring and incident response
- [ ] Sentry frontend errors received in production.
- [ ] Alert rules configured (error spike, auth failures, API failures).
- [ ] Cloudflare Security Events reviewed daily during launch week.
- [ ] Incident owner + escalation path documented.

Evidence / notes:
- Alert channels:
- Last test alert:
- Owner:

### 7) Backup and recovery
- [ ] Automated backups confirmed active.
- [ ] Restore test performed on a non-prod target.
- [ ] Recovery steps are documented and time-estimated.

Evidence / notes:
- Backup frequency:
- Last restore drill:
- Owner:

---

## P1 (Strongly recommended within first 1-2 weeks)

### 1) Dependency and supply-chain hygiene
- [ ] Dependency audit run and triaged.
- [ ] Update high/critical vulnerabilities.
- [ ] Enable automated dependency PRs/alerts.

### 2) API and abuse controls
- [ ] Endpoint-specific rate limits refined from real traffic.
- [ ] Add anomaly alerting for burst/fraud patterns.
- [ ] Block repeated abusive IPs using firewall rules.

### 3) Logging quality
- [ ] Security-relevant events are structured and searchable.
- [ ] Sensitive data is redacted from logs.
- [ ] Retention windows are defined.

### 4) Operational guardrails
- [ ] Runbook for auth outage, DB outage, and deploy rollback.
- [ ] On-call contact for launch week.
- [ ] Weekly security review routine scheduled.

---

## Quick Go/No-Go section

- [ ] **GO** if all P0 items are [x] Pass.
- [ ] **NO-GO** if any P0 item is [!] Fail.

Decision:
- Date:
- Approver:
- Final status: GO / NO-GO
