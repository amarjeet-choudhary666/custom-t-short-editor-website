# Deployment Guide

## Quick Deploy Options

### 1. Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Vercel will auto-detect Vite and deploy

### 2. Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

### 3. GitHub Pages

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Add to package.json:
```json
{
  "homepage": "https://yourusername.github.io/repo-name",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. Update vite.config.ts:
```typescript
export default defineConfig({
  base: '/repo-name/',
  // ... rest of config
})
```

4. Deploy:
```bash
npm run deploy
```

### 4. Manual Deployment

1. Build the project:
```bash
npm run build
```

2. Upload the `dist` folder to any static hosting service:
   - AWS S3 + CloudFront
   - Google Cloud Storage
   - Azure Static Web Apps
   - Any web server (Apache, Nginx)

## Environment Variables

If you need environment variables, create a `.env` file:

```
VITE_API_URL=your_api_url
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_URL
```

## Performance Tips

- The build is already optimized with Vite
- All assets are minified and bundled
- Consider adding a CDN for faster global delivery
- Enable gzip/brotli compression on your server

## Live Demo

After deployment, share:
- Live URL
- GitHub repository link
- Screenshots or video demo
