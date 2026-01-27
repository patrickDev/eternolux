# ------------------------
# Base image
# ------------------------
FROM node:20-alpine AS base
WORKDIR /app

# ------------------------
# Install dependencies
# ------------------------
FROM base AS deps

# Frontend dependencies
COPY client/package*.json ./client/
RUN cd client && npm install --include=dev

# Backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install

# ------------------------
# Build frontend (Next.js)
# ------------------------
FROM base AS build
COPY --from=deps /app /app
COPY client ./client
RUN cd client && npm run build

# ------------------------
# Production image
# ------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy backend code & deps
COPY --from=deps /app/server ./server

# Copy built frontend
COPY --from=build /app/client/.next ./client/.next
COPY client/public ./client/public
COPY client/package*.json ./client/

# Expose ports
EXPOSE 3000 4000

# Start backend and frontend together
CMD sh -c "node server/index.js & npm --prefix client start"
