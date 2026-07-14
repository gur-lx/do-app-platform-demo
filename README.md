# Learning Log — DigitalOcean App Platform Practice

A small 3-tier app (static frontend + Express API + Postgres, plus an
optional background worker) built specifically to exercise DigitalOcean
App Platform's core concepts:

- Static site component (buildpack, zero-config)
- Web service component (built from your own Dockerfile)
- Worker component (no public route, internal service discovery)
- Managed Postgres database, wired in via `app.yaml`
- Path-based routing (`/` → frontend, `/api` → API) on one app domain
- Declarative infra via `app.yaml` + `doctl`, instead of the UI

## Local test (optional, before deploying)

```bash
# API
cd api
npm install
npm start          # runs on :8080, works without DATABASE_URL for a smoke test

# Frontend — just open frontend/index.html in a browser,
# or serve it: npx serve frontend
```

Note: locally the frontend's relative `/api/...` calls won't reach the
API unless you proxy them — that routing only works once both
components are deployed under the same App Platform app domain. Easiest
local check is just hitting the API directly with curl:

```bash
curl http://localhost:8080/health
curl -X POST http://localhost:8080/api/entries -H "Content-Type: application/json" -d '{"title":"test"}'
```

## Deploy to DigitalOcean App Platform

### 1. Push this repo to GitHub
```bash
cd do-app-platform-demo
git init
git add .
git commit -m "Initial commit: learning log app"
gh repo create do-app-platform-demo --public --source=. --push
# or create the repo on GitHub manually and git remote add / push
```

### 2. Edit `app.yaml`
Replace `YOUR_GITHUB_USERNAME` (all three occurrences) with your actual
GitHub username.

### 3. Install and authenticate doctl
```bash
# macOS
brew install doctl
# Linux
snap install doctl

doctl auth init   # paste in a personal access token from the DO control panel
```

### 4. Create the app from the spec
```bash
doctl apps create --spec app.yaml
```

This kicks off the first build/deploy. Track it with:
```bash
doctl apps list
doctl apps get <app-id>
doctl apps list-deployments <app-id>
```

### 5. Update the app later
Once you tweak `app.yaml` or push new code (auto-deploys on push since
`deploy_on_push: true`), you can also push spec changes explicitly:
```bash
doctl apps update <app-id> --spec app.yaml
```

### 6. Watch logs
```bash
doctl apps logs <app-id> --component api --follow
doctl apps logs <app-id> --component uptime-worker --follow
```

### 7. Tear down when done practicing (avoid ongoing charges)
```bash
doctl apps delete <app-id>
```

## Suggested practice order

1. Deploy just the `frontend` static site component first — comment out
   `services` and `databases` in `app.yaml`, confirm the static site
   builds and serves.
2. Add the `api` service back in, but without the database — hit
   `/api/health` to confirm the Dockerfile build works and routing
   (`/api` prefix) is correct.
3. Add the `databases` block and the `DATABASE_URL` env var, redeploy,
   and confirm entries persist across requests.
4. Add the `uptime-worker` and check its logs to see it discovering the
   API via the internal `PRIVATE_URL` — no public networking involved.
5. Try scaling: bump `instance_count` on the API, redeploy, and watch
   how App Platform handles it.
