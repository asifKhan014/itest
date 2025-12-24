# iTest

Client-side purity checklist inspired by the Rice Purity Test. Built with React + TypeScript + Vite and designed to deploy to any static host.

## Requirements
- Node.js 20.19.0 or newer (Vite 7 requirement)
- npm 10+ (or any compatible package manager)

## Install
```bash
npm install
```

## Develop
```bash
npm run dev
```

## Build (deployment bundle)
```bash
npm run build
```
Outputs to `frontend/dist/`.

## Preview the production build
```bash
npm run preview
```

## Deploy
Upload the `dist/` folder to any static host (Netlify, Vercel static export, GitHub Pages, S3/CloudFront, etc.). No server is required; all logic runs in the browser and no data is posted externally.
# itest
