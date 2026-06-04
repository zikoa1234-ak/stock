# WORKING Dockerfile for EasyPanel
# Simple Node.js application
FROM node:18-alpine

WORKDIR /app

# Copy all files
COPY . .

# Install dependencies
RUN npm ci --only=production

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

USER nodejs

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["node", "server.js"]