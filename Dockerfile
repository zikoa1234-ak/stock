FROM node:18-alpine AS base

RUN apk add --no-cache git python3 make g++

FROM base AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./

RUN npm ci --only=production

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/src ./src/
COPY backend/tsconfig.json ./

RUN npm run build

FROM base AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

RUN npm install -g serve

COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/dist ./backend/dist
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/package*.json ./backend/
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend/prisma ./backend/prisma

COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

COPY --chown=nodejs:nodejs start.sh ./
RUN chmod +x start.sh

USER nodejs

EXPOSE 3000 3001

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

CMD ["./start.sh"]

