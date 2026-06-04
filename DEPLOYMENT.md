# EasyPanel Deployment Guide

## 📋 Prerequisites

1. **EasyPanel Account** with PostgreSQL service
2. **GitHub repository** with your code
3. **Domain** (optional, for custom domain)

## 🚀 Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Ready for EasyPanel deployment"
git push origin main
```

### 2. EasyPanel Setup

#### Option A: Auto-Deploy from GitHub
1. Go to EasyPanel Dashboard
2. Click "Add Project"
3. Select "From GitHub Repository"
4. Choose your repository
5. Select branch (usually `main`)

#### Option B: Manual Setup
1. Create new project in EasyPanel
2. Add service: "App" type
3. Select "Node.js" runtime
4. Set build context to root directory
5. Use the provided Dockerfile

### 3. Environment Variables

Add these environment variables in EasyPanel:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Random secure string | ✅ |
| `JWT_REFRESH_SECRET` | Random secure string | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `3001` | ✅ |

### 4. Database Setup

1. Add PostgreSQL service in EasyPanel
2. Note the connection details
3. Update `DATABASE_URL` with your actual connection string
4. The app will automatically run migrations on startup

### 5. Port Configuration

In EasyPanel service settings:
- **Port 3000**: Frontend (static files)
- **Port 3001**: Backend API

### 6. Domain Setup (Optional)
1. Add custom domain in EasyPanel
2. Point DNS to EasyPanel IP
3. Enable HTTPS (auto SSL with Let's Encrypt)

## 🔧 Configuration Files

### Dockerfile
- Single Dockerfile at root
- Builds both frontend and backend
- Runs on port 3000 (frontend) and 3001 (backend)

### start.sh
- Startup script that:
  1. Runs database migrations
  2. Starts backend API
  3. Serves frontend static files

## 📊 Database Migrations

The app automatically runs migrations on startup via:
```bash
npx prisma migrate deploy
```

## 🔒 Security Notes

1. **Change default passwords**: Update JWT secrets in production
2. **Use HTTPS**: Enable SSL in EasyPanel
3. **Regular backups**: Configure database backups in EasyPanel
4. **Monitor logs**: Check EasyPanel logs for errors

## 🚨 Troubleshooting

### Common Issues:

1. **"Dockerfile not found"**
   - Ensure Dockerfile is at root directory
   - Check build context in EasyPanel settings

2. **Database connection errors**
   - Verify DATABASE_URL environment variable
   - Check PostgreSQL service is running
   - Ensure network connectivity between services

3. **Build failures**
   - Check Node.js version (requires 18+)
   - Verify all required files are in repository
   - Check EasyPanel build logs

4. **Application won't start**
   - Verify ports 3000 and 3001 are exposed
   - Check environment variables
   - Review startup logs

### Logs Location:
- EasyPanel → Your Project → Service → Logs
- Backend logs: Port 3001
- Frontend logs: Port 3000

## 📞 Support

If issues persist:
1. Check EasyPanel documentation
2. Review application logs
3. Verify environment variables
4. Test locally with Docker Compose first

## 🎯 Success Indicators

1. ✅ Build completes without errors
2. ✅ Database migrations run successfully
3. ✅ Application starts on ports 3000/3001
4. ✅ API health check passes: `GET /api/health`
5. ✅ Frontend loads at your domain

---

**Default Admin Credentials after deployment:**
- Email: `admin@stock.com`
- Password: `Admin@123`

**IMPORTANT**: Change these credentials after first login!