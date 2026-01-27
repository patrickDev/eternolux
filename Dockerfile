# ------------------------
# Base
# ------------------------
FROM node:20-alpine AS base
WORKDIR /app

# ------------------------
# Dependencies
# ------------------------
FROM base AS deps

RUN mkdir -p client server

# Frontend deps
COPY client/package*.json ./client/
RUN cd client && npm install --include=dev

# Backend deps
COPY server/package*.json ./server/
RUN cd server && npm install

# ------------------------
# Build frontend
# ------------------------
FROM base AS build
WORKDIR /app

RUN mkdir -p client

COPY --from=deps /app /app
COPY client ./client

RUN cd client && npm run build

# ------------------------
# Runtime
# ------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN mkdir -p client server

# Backend
COPY --from=deps /app/server ./server

# Frontend
COPY --from=build /app/client/.next ./client/.next
COPY --from=build /app/client/public ./client/public
COPY --from=deps /app/client/package*.json ./client/

EXPOSE 3000 4000

CMD sh -c "node server/index.js & npm --prefix client start"
