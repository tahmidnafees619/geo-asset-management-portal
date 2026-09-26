# Security Policy

## Project Scope

The Municipal Asset & Infrastructure Management Portal is a **client-side demonstration application**. It ships with mock spatial data ([`app/lib/data/`](app/lib/data)), holds all application state in the browser (React state — nothing is persisted server-side), and calls no first-party backend or database. The only network calls it makes are read-only tile requests to third-party basemap providers (Esri, CARTO/OpenStreetMap) for map rendering.

Given that scope, most classic web application risks (authentication bypass, data-at-rest exposure, server-side injection) do not apply. Reports are still welcome for anything that affects the integrity of the codebase, the build pipeline, or a user's browser session — see below.

## Supported Versions

This is a single-branch portfolio project. Security fixes are applied only to the latest commit on `main`; there are no maintained release branches or LTS versions.

| Version         | Supported          |
| --------------- | ------------------- |
| `main` (latest) | ✅                   |
| Older commits   | ❌                   |

## Reporting a Vulnerability

If you discover a security issue — for example, a cross-site scripting (XSS) vector in a rendered popup/tooltip, a dependency with a known CVE, or a build/config issue that could leak secrets — please report it privately rather than opening a public issue:

1. **Preferred:** Use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) feature on this repository (Security → Report a vulnerability).
2. **Alternative:** Open a GitHub issue titled `[SECURITY]` with minimal public detail and a request for a private follow-up channel.

Please include:

- A clear description of the issue and its potential impact.
- Steps to reproduce (a minimal repro is ideal).
- The affected file(s)/component(s), if known.

### What to expect

- **Acknowledgement:** within 5 business days.
- **Triage:** we'll confirm whether it's in scope and assess severity.
- **Fix timeline:** best-effort, prioritized by severity — critical issues (e.g. a supply-chain/dependency compromise) are addressed as soon as possible; low-severity or cosmetic issues are scheduled at maintainer discretion.
- **Disclosure:** please allow the fix to land before any public disclosure. Credit is happily given in the commit message or release notes if you'd like it.

## Out of Scope

- Vulnerabilities in third-party tile providers (Esri, CARTO, OpenStreetMap) — report those upstream.
- Denial-of-service reports against the demo dataset (it's static mock data with no rate limits to bypass).
- Missing security headers on a local `next dev` server — production deployments should be hardened separately (CSP, HSTS, etc.) as part of your own deployment pipeline.

## Dependency Hygiene

This project uses `npm` for dependency management. Run `npm audit` periodically and keep `next`, `react`, `leaflet`, and `proj4` up to date — these are the packages most likely to receive upstream security patches.
