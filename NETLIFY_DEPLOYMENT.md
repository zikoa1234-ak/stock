# Netlify Deployment Instructions

## Current Setup
Your project has been configured for Netlify deployment as a **static PWA (Progressive Web App)**.

## What's Included
1. ✅ Fixed `package.json` (removed invalid JSON content)
2. ✅ Created `netlify.toml` configuration file
3. ✅ Created `.gitignore` file
4. ✅ Set up proper build configuration

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Fix Netlify deployment"
git push origin main
```

### 2. Deploy on Netlify
1. Go to [Netlify](https://app.netlify.com/)
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository
4. Configure build settings:
   - **Build command**: (auto-detected from netlify.toml)
   - **Publish directory**: `pwa-stock-manager`
5. Click "Deploy site"

## Important Notes

### Backend API
Your PWA includes a backend Express API (`pwa-stock-manager/server.js`) which **WILL NOT WORK** on Netlify as-is. Netlify only hosts static files or serverless functions.

**Solutions for the backend:**
- **Option 1**: Host backend separately (Render, Railway, Heroku)
- **Option 2**: Convert to Netlify Functions (more complex)
- **Option 3**: Use a backend-as-a-service (Supabase, Firebase)

### Frontend API Calls
Your PWA JavaScript makes API calls to `localhost:5000`. You need to:
1. Host the backend somewhere
2. Update the API URL in your JavaScript files

### Environment Variables (if needed)
Set these in Netlify dashboard → Site settings → Environment variables:
- `API_URL`: Your backend API URL
- Any other environment variables your PWA needs

## Testing Locally
```bash
# Serve the PWA locally
cd pwa-stock-manager
python3 -m http.server 8080
# or
npx serve .
```

## Troubleshooting
If you get build errors:
1. Check Netlify build logs for specific errors
2. Ensure `package.json` is valid JSON
3. Verify all files are committed to git
4. Check that `netlify.toml` has correct paths

## Next Steps
1. Deploy the static PWA to Netlify
2. Set up backend hosting (Render is recommended: https://render.com)
3. Update frontend API URLs to point to your hosted backend
4. Configure CORS on your backend to allow Netlify domain

## Support
If you encounter issues:
1. Check Netlify community forums
2. Review Netlify documentation
3. Check build logs for specific error messages