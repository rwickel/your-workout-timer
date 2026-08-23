# Docker Deployment

The app ships as a production container: multi-stage build (Node → nginx) with SPA fallback so shared WOD links (`/wod?d=…`) work.

## Quick Start

```sh
docker compose up -d --build
```

App is then available at **http://localhost:8090**

## Updating the Running App

After code changes, run from this folder:

```sh
# 1. Rebuild the image with the new code and restart the container
docker compose up -d --build

# 2. (Optional) verify it's up
docker ps                      # container "workout-timer" should be "Up"
curl http://localhost:8090     # should return HTML
```

That's it — `--build` forces a fresh image build, `-d` recreates the running container in place. Any Tailscale proxy pointing at port 8090 serves the new version immediately.

| Change type | Action |
|---|---|
| `src/` files only | `docker compose up -d --build` (~1–2 min) |
| `package.json` dependencies | same command; `npm ci` layer rebuilds automatically |
| `Dockerfile` / `nginx.conf` | same command |

## Exposing via Tailscale (HTTPS + PWA install)

Valid HTTPS is required for PWA install prompts on Android. With Tailscale installed:

```sh
tailscale funnel --bg 8090    # public:  https://<machine>.ts.net -> localhost:8090
# or tailnet-only:
tailscale serve --bg 8090     # https://<machine>.ts.net (tailnet devices only)
```

Shared WOD links are built from `SHARE_ORIGIN` in `src/lib/wodShare.ts` — set it to your public URL.

To revoke exposure:

```sh
tailscale funnel --https=443 off
```

## Useful Commands

```sh
docker logs workout-timer          # view logs
docker restart workout-timer       # restart without rebuild
docker compose down                # stop and remove container
docker image prune -f              # clean up old dangling images
```

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build: `node:22-alpine` build → `nginx:alpine` serve |
| `nginx.conf` | Port 8090, SPA fallback (`try_files … /index.html`), asset caching |
| `docker-compose.yml` | Service definition, port mapping `8090:8090`, `restart: unless-stopped` |
