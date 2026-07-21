<div align="center">

# 🐳 Dockertor

**A clean, real-time dashboard to inspect your Docker containers.**

[![CI](https://github.com/rolljee/dockertor/actions/workflows/ci.yml/badge.svg)](https://github.com/rolljee/dockertor/actions/workflows/ci.yml)
[![Release](https://github.com/rolljee/dockertor/actions/workflows/release.yml/badge.svg)](https://github.com/rolljee/dockertor/actions/workflows/release.yml)
[![GitHub release](https://img.shields.io/github/v/release/rolljee/dockertor?include_prereleases&sort=semver)](https://github.com/rolljee/dockertor/releases)

</div>

![Dockertor dashboard](./screenshots/example.png)

## Overview

Dockertor is a small web app that surfaces everything `docker ps` knows about
your containers in a dashboard built for DevOps readability — status at a
glance, searchable, auto-refreshing. It started as an experiment to learn
Bun & Svelte, and now ships as versioned container images.

## Features

- 📊 **At-a-glance stats** — total, running, exited and paused counts.
- 🎨 **Status-coloured cards** — each container's state is instantly readable.
- 🔎 **Search & filter** — by name, image or ID, and by container state.
- 📋 **Copyable IDs** and formatted ports, networks, mounts and labels.
- 🔁 **Auto-refresh** every few seconds, with a manual refresh too.
- 🌙 **Dark console theme** designed for long dashboards.

## Usage

```bash
docker compose up
```

Once started:

- Web UI: http://localhost:5173
- API: http://localhost:3000

> The API reads the host Docker socket (`/var/run/docker.sock`) to run
> `docker ps`, so it lists the containers of the host it runs on.

## Local development

```bash
# API (Bun, hot reload) — http://localhost:3000
cd api && bun install && bun run start

# Web (SvelteKit dev server) — http://localhost:5173
cd web && npm install && npm run dev
```

Type-check and build the web app with `npm run check` and `npm run build`.

## Tech stack

- Bun (API server)
- Svelte 5 + SvelteKit 2
- Vite 8
- Tailwind CSS 4
- TypeScript
- Docker

## Container images

Every release publishes two images to GitHub Container Registry:

- `ghcr.io/rolljee/dockertor-api`
- `ghcr.io/rolljee/dockertor-web`

Tagged with the exact version (e.g. `1.2.0`), plus a moving tag: `latest`
for stable releases and `beta` for `develop` pre-releases.

## Branching & releases

The project follows a classic **main / develop** flow with automated releases
driven by [semantic-release](https://semantic-release.gitbook.io/) and
[Conventional Commits](https://www.conventionalcommits.org/).

| Branch    | Purpose                | Result on push                              |
| --------- | ---------------------- | ------------------------------------------- |
| `develop` | Integration branch     | `x.y.z-beta.n` pre-release + `beta` images  |
| `main`    | Stable releases        | `x.y.z` release + `latest` images           |

Workflow:

1. Branch off `develop`, open a PR — **CI** runs type-checks, the web build and
   builds both Docker images (without pushing).
2. Merge into `develop` — a **beta** pre-release is published automatically.
3. Merge `develop` into `main` — the **stable** release is published: version
   bump, `CHANGELOG.md`, git tag, GitHub Release and the versioned images.

Commit messages drive the version bump:

| Type                 | Release |
| -------------------- | ------- |
| `fix: …`             | patch   |
| `feat: …`            | minor   |
| `feat!: …` / `BREAKING CHANGE:` | major |

Preview the next version locally with `npm run release:dry`.

> **Repo setup required:** enable *Read and write permissions* for the
> `GITHUB_TOKEN` (Settings → Actions → General → Workflow permissions), create a
> `develop` branch, and make sure branch protection allows the GitHub Actions
> bot to push the release commit to `main`.
