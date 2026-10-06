# Hostinger Migration — Remaining Steps

Status log for the Firebase + Google Cloud Run → Hostinger VPS migration.

## Already done

- **SSL fixed** — `aidocs.lumoslogic.com` now serves a valid Let's Encrypt cert
  (issuer `C=US, O=Let's Encrypt`, valid Oct 6 2026 → Jan 4 2027).
  Root cause was a leftover Firebase `AAAA` record (`2620:0:890::100`) pointing
  the domain at Firebase instead of the VPS (`187.127.146.194`).
- **CORS error resolved** — was the old Firebase frontend calling the old Cloud Run
  API cross-origin. Gone now that frontend + backend share one origin via Nginx.
- **Firebase deploy config removed** from the repo:
  - `.firebaserc`, `firebase.json`, `.firebase/` (root)
  - `platform-admin/.firebaserc`, `platform-admin/firebase.json`, `platform-admin/.firebase/`
  - `frontend/vercel.json`
- **Docs/env updated:**
  - `FEATURES.md` architecture notes → Hostinger VPS + Traefik + Nginx + docker-compose
  - `ai-service/.env` → `FRONTEND_URL` and `ALLOWED_ORIGINS` point at `https://aidocs.lumoslogic.com`
  - `.gitignore` / `.dockerignore` — dead `.firebase` entries removed

## Remaining steps (to run on the VPS, `root@srv1560113`)

### 1. Sync production `.env` (gitignored, so not shipped by git)

The VPS has its own `ai-service/.env`. Update two values to match the repo:

```bash
cd /opt/quotationmaker
sed -i 's|^FRONTEND_URL=.*|FRONTEND_URL=https://aidocs.lumoslogic.com|' ai-service/.env
sed -i 's|^ALLOWED_ORIGINS=.*|ALLOWED_ORIGINS=https://aidocs.lumoslogic.com,http://localhost:3000,http://localhost:3001|' ai-service/.env
docker compose restart backend
```

### 2. Verify DNS has no other leftover records

`aidocs.lumoslogic.com` should have **only** an `A` record → `187.127.146.194`.
No `AAAA`, no `CNAME`, no Cloudflare/Firebase proxy. Also confirm no other
`*.lumoslogic.com` subdomains still carry Firebase A/AAAA records.

```bash
dig @8.8.8.8 aidocs.lumoslogic.com A +short
dig @8.8.8.8 aidocs.lumoslogic.com AAAA +short
```

### 3. Decommission the old infra (after traffic is stable on Hostinger)

- Firebase project `lumoslogic-3770b` — delete the `aidocs-lumoslogic` hosting site
  and any leftover custom-domain mapping.
- Firebase project `devtrackrbylumos` — delete the `docuflowai-platform-admin` site.
- Google Cloud Run service `docflowai` (`asia-south1`, project id `docflowai-874559728801`)
  — delete once nothing calls it anymore.

### 4. Rotate hardcoded secrets

`ai-service/.env` contains plaintext defaults that were committed earlier.
Generate new values and update both the local and VPS `.env`:

- `JWT_SECRET` — `python -c "import secrets; print(secrets.token_hex(32))"`
- `ADMIN_SECRET`
- `GEMINI_API_KEY`, `GROQ_API_KEY`, `CLOUDINARY_*`, `SMTP_PASSWORD` — rotate at the provider
  and re-add.

### 5. (Optional) Version-control the Traefik config

Traefik currently lives only at `/docker/traefik/` on the VPS (docker-compose +
`config/quotationmaker.yml`). Consider adding it to this repo so the reverse-proxy
setup is reproducible and reviewable.

## Notes

- Deploy flow: push to `main` → `.github/workflows/deploy.yml` SSHes to the VPS and
  runs `git pull` + `docker compose build/up`. `deploy.sh` does the same manually.
- Still-active Google integrations (intentionally kept, NOT Firebase/Cloud Run):
  - Google **Gemini** (`google-genai`, `GEMINI_API_KEY`) — AI provider
  - **Convex** (`CONVEX_URL`, `frontend/convex/`) — database
  - **Cloudinary** — file storage
  - Google Fonts in PDF templates
