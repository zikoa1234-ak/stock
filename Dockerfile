# Dockerfile for EasyPanel - Stock Management
FROM node:18-alpine
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Copy app files
COPY . .

# Create a simple Express server
RUN echo 'const express = require("express"); const app = express(); const PORT = process.env.PORT || 8080; app.use(express.json()); app.get("/api/health", (req, res) => res.json({status: "OK", service: "Stock Management", timestamp: new Date().toISOString()})); app.get("/", (req, res) => res.send("<h1>Stock Management System</h1><p>API is running. Check <a href=\"/api/health\">/api/health</a></p>")); app.listen(PORT, () => console.log("Server running on port " + PORT));' > server.js

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

CMD ["node", "server.js"]
