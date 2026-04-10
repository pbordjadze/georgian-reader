# ქართული Reader

A single-page Georgian reading PWA. No build step, no backend.

## Files

- `index.html` — the entire app (React via CDN, JSX compiled in-browser)
- `manifest.webmanifest` — PWA manifest
- `sw.js` — service worker for offline caching
- `icon-*.png` / `apple-touch-icon.png` — PWA icons

## Deploy to GitHub Pages

1. Create a new repo, push all the files in this folder to the root
2. In repo Settings → Pages, set source to your branch (usually `main`) and folder `/` (root)
3. Wait ~1 minute for the deploy
4. Your site will be at `https://<username>.github.io/<repo-name>/`

## Install on iPhone

1. Open the GitHub Pages URL in Safari (must be Safari, not Chrome, for PWA install on iOS)
2. Tap the share button → "Add to Home Screen"
3. Open from the home screen icon — it'll launch in standalone mode

After the first load with a network connection, the service worker caches everything, so it'll work fully offline on subsequent launches.

## Data persistence

All stories, saved words, and archive state live in `localStorage` under the `georgian-reader:*` keys. iOS may evict localStorage for PWAs that haven't been opened in ~7 weeks, so use the **export backup** button periodically to save a JSON file you can re-import.

## Updating the app

When you change `index.html` or `sw.js`, bump `CACHE_NAME` in `sw.js` (e.g. `v1` → `v2`) so existing installs pick up the new version on next launch.
