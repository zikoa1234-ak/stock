# Stock Management System

## 🚀 Deployment on EasyPanel

This is a simple Node.js application that will deploy successfully on EasyPanel.

### Features:
- ✅ Simple Express server
- ✅ Health check endpoint at `/api/health`
- ✅ Port 8080 (configurable via PORT environment variable)
- ✅ Dockerized with Node.js 18 Alpine
- ✅ Production-ready

### Environment Variables:
- `PORT` - Server port (default: 8080)

### Deployment:
1. Push to GitHub
2. Create project in EasyPanel
3. Select "From GitHub Repository"
4. Deploy!

### After Deployment:
- Check health: `https://your-domain.com/api/health`
- Default page: `https://your-domain.com/`

### Note:
The app uses port 8080 to avoid conflicts with EasyPanel's default ports.
