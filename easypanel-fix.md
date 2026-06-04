# Quick Fix for EasyPanel Docker Build Error

If you're getting this error:
```
ERROR: support Docker Image manifest version 2, schema 1 has been removed.
```

## 🚨 Immediate Fix:

### 1. Delete any existing Docker templates in EasyPanel:
- Go to EasyPanel → Your Project → Settings
- Remove any Dockerfile templates
- Use ONLY the Dockerfile from this repository

### 2. Manual Dockerfile Override in EasyPanel:
If EasyPanel keeps using a template:

#### Option A: SSH into server and replace Dockerfile
```bash
# Connect to your server
ssh user@your-server

# Navigate to project directory
cd /etc/easypanel/projects/your-project/your-service/code

# Replace Dockerfile
rm Dockerfile
wget https://raw.githubusercontent.com/your-username/your-repo/main/Dockerfile
```

#### Option B: Use EasyPanel's file editor:
1. Go to EasyPanel → Your Project → Service
2. Click "File Manager" or "Edit Files"
3. Delete existing Dockerfile
4. Upload/copy the Dockerfile from this repo

### 3. Force Rebuild:
After updating Dockerfile:
1. Go to EasyPanel → Your Project → Service
2. Click "Rebuild" or "Deploy"
3. Monitor build logs

## 🔧 Alternative: Use EasyPanel's Node.js Template

If Dockerfile issues persist, try:

1. **Delete current service** in EasyPanel
2. **Create new service** with these settings:
   - Service Type: "App"
   - Runtime: "Node.js"
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Port: `3000`

3. **Then add environment variables:**
   - `DATABASE_URL` (from PostgreSQL service)
   - `JWT_SECRET` (random string)
   - `NODE_ENV=production`

## 📞 If Issues Persist:

### Contact EasyPanel Support:
1. Provide the build error logs
2. Show them this Dockerfile
3. Ask them to clear any cached templates

### Temporary Workaround:
Use the included `docker-compose.prod.yml` to deploy manually on a VPS:
```bash
# On your VPS
git clone your-repo
cd your-repo
docker-compose -f docker-compose.prod.yml up -d
```

## ✅ Verification:

After successful deployment:
1. Check logs: `docker logs your-container`
2. Test endpoints:
   - Frontend: `http://your-domain.com:3000`
   - Backend: `http://your-domain.com:3001/api/health`
3. Login with default credentials:
   - Admin: `admin@stock.com` / `Admin@123`

## 🎯 Root Cause:
EasyPanel was trying to use an old Docker template (`docker/whalesay:latest`) which is deprecated. The new Dockerfile uses modern Node.js 18 Alpine base image.

**The fix is to ensure EasyPanel uses our Dockerfile, not its template.**