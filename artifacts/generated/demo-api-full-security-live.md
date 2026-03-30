# Gateproof Full Security Check

**Target:** `examples/demo-api/`
**Date:** 2026-03-30
**Assessor:** gateproof:full-security-check

---

## Executive Summary

The demo-api is a Node.js/Express REST API with accompanying Kubernetes ingress and a GitHub Actions delivery pipeline. Every major modern security control is either absent or critically broken. Five independently exploitable critical-severity issues exist across the application, secrets, and CI/CD layers. An unauthenticated attacker with internet access to the ingress can enumerate all users, read credentials, exfiltrate the production deployment key, and pivot to internal infrastructure via SSRF — all without needing a valid account.

The surface area is small (4 files, ~80 lines of application code), but the density of critical findings is unusually high. This codebase would fail any serious security review and should not be deployed in any real environment.

**Risk summary:**

| Severity | Count |
|----------|-------|
| Critical | 5     |
| High     | 3     |
| Medium   | 2     |
| Low      | 1     |

---

## Highest-Risk Findings

### F-1 · MOD-APP-01 · Critical — Unauthenticated Admin User Enumeration

**Evidence:** `src/server.js:48–50`

```js
app.get("/admin/users", (_req, res) => {
  return res.json(Object.values(USERS));
});
```

No authentication middleware is applied. Any HTTP client can call `GET /admin/users` and receive the full user list including emails and partially masked SSNs. The ingress routes `admin.demo.example.com` to the same backend on port 3000, so this endpoint is reachable from the public internet with no additional barriers.

**Impact:** Full user enumeration; PII exposure (email, ssnMasked fields); prerequisite for targeted credential attacks.

---

### F-2 · MOD-SUP-02 · Critical — CI/CD Secret Leak via `pull_request_target`

**Evidence:** `ci/deploy.yml:3–21`

```yaml
on:
  pull_request_target:
    branches:
      - main
```

```yaml
run: |
  echo "deploying with $PROD_API_KEY"
```

`pull_request_target` runs in the context of the base repository's secrets, even for PRs opened from forks. The `PROD_API_KEY` is then interpolated directly into an `echo` command, printing it in plain text to the job log. Any contributor (or attacker who can open a PR) can trigger this workflow and read the production API key from the public Actions log.

**Impact:** Full exfiltration of `PROD_API_KEY` by any user with fork-and-PR access to the repository.

---

### F-3 · MOD-APP-03 · Critical — Blind SSRF on `/preview`

**Evidence:** `src/server.js:52–57`

```js
app.get("/preview", async (req, res) => {
  const targetUrl = req.query.url;
  const upstream = await fetch(targetUrl);
  const text = await upstream.text();
  return res.send(text.slice(0, 500));
});
```

The `url` query parameter is passed directly to `fetch()` without any validation, scheme restriction, or destination allowlist. No authentication is required on this endpoint. An attacker can:

- Reach cloud instance metadata services (`http://169.254.169.254/latest/meta-data/`)
- Probe internal Kubernetes service IPs
- Hit internal HTTP APIs that trust the pod's network identity

**Impact:** Cloud credential theft, internal network reconnaissance, lateral movement from the pod's network identity.

---

### F-4 · MOD-DAT-01 / MOD-DAT-03 · Critical — Hardcoded Credentials and Plaintext Password Storage

**Evidence:** `src/auth.js:1–6`

```js
export const JWT_SECRET = process.env.JWT_SECRET || "demo-secret-change-me";

const USERS = [
  { id: "u-100", email: "admin@example.com", password: "admin1234", role: "admin" },
  { id: "u-200", email: "user@example.com", password: "password123", role: "user" }
];
```

Credentials are hardcoded in source code. Passwords are stored and compared in plaintext — no hashing, no bcrypt, no constant-time comparison. If `JWT_SECRET` is not set in the environment, the well-known fallback string `"demo-secret-change-me"` is used, allowing any attacker to forge valid JWTs.

**Impact:** Anyone with source read access (including CI logs or public repo) can authenticate as admin. Known-secret JWTs can be forged offline.

---

### F-5 · MOD-AUT-01 · Critical — JWT Error Swallowed, Unauthenticated Fallback to `null` Requester

**Evidence:** `src/server.js:32–34`

```js
const token = authHeader.replace("Bearer ", "");
const requester = token ? jwt.verify(token, JWT_SECRET) : null;
```

`jwt.verify()` throws on invalid or expired tokens. This call is not wrapped in try/catch. If verification throws, the request crashes the handler or produces an unhandled promise rejection depending on Express version — not a clean 401. More critically, when no token is present the requester is set to `null` and passed to `canReadUser()`, which returns `false` — but `canReadUser` is not called for `/admin/users` at all (see F-1), so the null-check path provides no defense for the highest-risk endpoint.

**Impact:** Unpredictable auth behavior on malformed/expired tokens; no defense-in-depth for the admin surface.

---

## Findings By Security Theme

### Authentication and Session (MOD-AUT)

| ID | Control | Severity | Finding |
|----|---------|----------|---------|
| F-5 | MOD-AUT-01 | Critical | `jwt.verify()` unguarded; null requester fallback |
| F-6 | MOD-AUT-02 | High | 7-day JWT TTL with no revocation mechanism |
| F-7 | MOD-AUT-03 | High | No rate limiting on `POST /login`; brute-force trivial |

**F-6 detail — Long-lived, irrevocable tokens** (`src/server.js:22–27`): Tokens are signed with a 7-day expiry and no server-side revocation list. A stolen token stays valid for up to a week with no way to invalidate it short of rotating the signing secret and invalidating all sessions simultaneously.

**F-7 detail — No login throttling** (`src/server.js:14–29`): The `/login` endpoint applies no rate limiting, lockout, or CAPTCHA. Credential-stuffing or brute-force against the two known accounts (which have weak passwords visible in source) is trivially automated.

---

### Application and Authorization (MOD-APP)

| ID | Control | Severity | Finding |
|----|---------|----------|---------|
| F-1 | MOD-APP-01 | Critical | `/admin/users` fully unauthenticated |
| F-3 | MOD-APP-03 | Critical | Unrestricted SSRF on `/preview` |

The `/api/users/:id` ownership check (`src/auth.js:21–31`) is structurally sound for normal user reads, but it is entirely absent for the admin endpoint. Input validation is absent across all endpoints — no schema enforcement on `req.body` for login, no URL scheme validation for `/preview`.

---

### Secrets and Data Protection (MOD-DAT)

| ID | Control | Severity | Finding |
|----|---------|----------|---------|
| F-4 | MOD-DAT-01 | Critical | Hardcoded credentials and weak default JWT secret |
| F-4 | MOD-DAT-03 | Critical | Plaintext password comparison, no hashing |
| F-8 | MOD-DAT-02 | Medium | Full request body logged at login including password field |

**F-8 detail — Credential logging** (`src/server.js:15`):

```js
console.log("login_attempt", { body: req.body });
```

The full request body — including the submitted password — is written to stdout at every login attempt. In any log-aggregation setup this would persist plaintext passwords in logs.

---

### Supply Chain and Delivery (MOD-SUP)

| ID | Control | Severity | Finding |
|----|---------|----------|---------|
| F-2 | MOD-SUP-02 | Critical | `pull_request_target` + secret echo = full key leak |
| F-9 | MOD-SUP-01 | Medium | No dependency lockfile or scanner configuration present |

**F-9 detail:** No `package-lock.json`, `yarn.lock`, or equivalent lockfile is present in the repository. No dependency scanning (Dependabot, Snyk, npm audit) is configured. The CI workflow installs and builds without pinned dependency resolution.

---

### Operations and Resilience (MOD-OPS)

| ID | Control | Severity | Finding |
|----|---------|----------|---------|
| F-10 | MOD-OPS-03 | High | Admin endpoint publicly routed with no ingress-level auth |
| F-8 | MOD-OPS-01 | Medium | (see above) credential exposure in logs |

**F-10 detail** (`config/ingress.yaml:17–26`): `admin.demo.example.com` routes to the same backend service on the same port as the public API, with no TLS termination configured in the Ingress spec, no `nginx.ingress.kubernetes.io/auth-*` annotations, and no network policy separating admin from public traffic. The Ingress also lacks TLS configuration entirely — HTTP only.

---

## Likely Exploit Paths

### Path 1 — Anonymous Admin Dump (0 credentials required)

1. Attacker sends `GET https://admin.demo.example.com/admin/users`
2. Server returns full USERS object: emails, roles, partial SSNs
3. No authentication, rate limit, or network policy prevents this

**Time to exploit:** < 1 minute from a browser.

---

### Path 2 — Fork-PR CI Secret Exfiltration

1. Attacker forks the repository on GitHub
2. Opens a pull request targeting `main`
3. `pull_request_target` trigger fires; GitHub injects `PROD_API_KEY` into the job environment
4. `echo "deploying with $PROD_API_KEY"` prints the secret in the Actions log
5. Attacker reads the log from the public Actions UI

**Time to exploit:** ~5 minutes; requires a GitHub account.

---

### Path 3 — SSRF to Cloud Metadata → Credential Theft

1. Attacker calls `GET /preview?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/`
2. Server fetches the URL from within the pod's network using the pod's IAM identity
3. Response (up to 500 chars) is returned to the attacker
4. Attacker iterates to retrieve IAM role name, then full temporary credentials
5. With cloud credentials, attacker escalates to broader AWS/GCP/Azure access

**Prerequisites:** The pod must run in a cloud environment with an instance metadata service. No authentication needed on `/preview`.

---

### Path 4 — JWT Forgery → Privilege Escalation

1. Attacker observes default `JWT_SECRET = "demo-secret-change-me"` in source or README
2. Attacker crafts a JWT with `{ "sub": "u-100", "role": "admin" }` signed with this secret
3. Token is accepted by `jwt.verify()` at `/api/users/:id`
4. Attacker reads any user record as admin

**Prerequisites:** If `JWT_SECRET` env var is unset (common in dev/staging), this works immediately. Requires no existing account.

---

### Path 5 — Brute-Force Login → Admin Token

1. Attacker knows `admin@example.com` from the unauthenticated `/admin/users` dump (Path 1)
2. Sends rapid POST requests to `/login` with common password lists
3. No throttle, lockout, or CAPTCHA blocks iteration
4. Obtains admin JWT valid for 7 days; no revocation possible

---

## KISA Coverage vs Real Risk

| KISA Control Area | Surface Status | Real Risk |
|-------------------|---------------|-----------|
| Authentication present | Login endpoint exists with JWT | Critical: hardcoded creds, no MFA, brute-force unblocked |
| Access control present | `canReadUser()` implemented for `/api/users/:id` | Critical: admin endpoint completely bypasses all auth |
| TLS | Not configured in Ingress spec | HTTP only; all tokens and credentials travel in cleartext |
| Secrets externalized | `JWT_SECRET` reads from `process.env` | Critical: falls back to known default; `PROD_API_KEY` printed in CI |
| Logging enabled | `console.log` calls present | High: logs contain submitted passwords |
| Input validation | None | Critical: SSRF via unvalidated URL parameter |
| Dependency management | Dependencies declared | Medium: no lockfile, no scanner |

**Verdict:** This API would likely **fail** even a baseline KISA compliance review on authentication, access control, and secret handling. In the unlikely scenario a surface-level check passed, the real exploitability is far worse than the compliance gap suggests — five independently exploitable critical paths require no special access.

---

## Recommended Remediation Order

| Priority | Finding | Action |
|----------|---------|--------|
| **1 — Immediate** | F-2: CI/CD secret leak | Change `pull_request_target` to `pull_request`. Remove `echo` of `PROD_API_KEY`. Rotate the leaked key now. |
| **2 — Immediate** | F-1: Unauthenticated admin endpoint | Add authentication middleware to `GET /admin/users`. Separate admin routing from public API at the network or service level. |
| **3 — Immediate** | F-3: SSRF on `/preview` | Add URL scheme allowlist (HTTPS only), hostname/IP blocklist covering `169.254.0.0/16`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`. Require authentication. |
| **4 — Immediate** | F-4: Hardcoded credentials / plaintext passwords | Remove hardcoded credentials. Use bcrypt or Argon2 for password storage. Rotate `JWT_SECRET` to a cryptographically random value injected via secrets manager. |
| **5 — High** | F-5: Unguarded `jwt.verify()` | Wrap in try/catch. Return 401 on any verification failure. |
| **6 — High** | F-7: No login rate limiting | Add per-IP rate limiting middleware (e.g., `express-rate-limit`) to `POST /login`. |
| **7 — High** | F-8: Password logged | Redact or remove `req.body` from login log line. |
| **8 — High** | F-10: Admin publicly routed, no TLS | Add TLS to Ingress. Add `nginx.ingress.kubernetes.io/auth-*` annotations or deploy a network policy isolating the admin surface. |
| **9 — Medium** | F-6: Long-lived irrevocable tokens | Reduce JWT TTL to ≤ 15 minutes with a refresh-token pattern, or implement a server-side revocation list. |
| **10 — Medium** | F-9: No dependency lockfile | Commit `package-lock.json`. Enable Dependabot or equivalent. Pin `actions/checkout` to a commit SHA. |
