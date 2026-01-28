# ---------- deps (install deps for build) ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Avoid npm ci strictness + bypass peer conflicts
RUN npm install --legacy-peer-deps

# ---------- build (Next.js build) ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner (production) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install production dependencies only (smaller image)
COPY package.json package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
