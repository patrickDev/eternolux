# -------------------------
# Server deps
# -------------------------
FROM node:20-alpine AS server_deps
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm install --legacy-peer-deps

# -------------------------
# Server build
# -------------------------
FROM node:20-alpine AS server_build
WORKDIR /app/server
COPY --from=server_deps /app/server/node_modules ./node_modules
COPY server/ ./
RUN npm run build

# -------------------------
# Client deps
# -------------------------
FROM node:20-alpine AS client_deps
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install --legacy-peer-deps

# -------------------------
# Client build
# (NEXT_PUBLIC_* is inlined at build time)
# -------------------------
FROM node:20-alpine AS client_build
WORKDIR /app/client
COPY --from=client_deps /app/client/node_modules ./node_modules
COPY client/ ./

ARG NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:4000
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
RUN npm run build

# -------------------------
# Runner - run BOTH processes
# -------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN apk add --no-cache supervisor

# ---- Server runtime deps ----
WORKDIR /app/server
COPY server/package.json server/package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force
COPY --from=server_build /app/server/dist ./dist
ENV PORT=4000

# ---- Client runtime deps ----
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force
COPY --from=client_build /app/client/.next ./.next
COPY --from=client_build /app/client/public ./public
ENV NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:4000

# Supervisor config
WORKDIR /app
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 3000 4000
CMD ["supervisord", "-c", "/etc/supervisord.conf"]
