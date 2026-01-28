# ---------- deps (install full deps for build) ----------
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Use npm install to avoid npm ci lockfile strict failures.
# legacy-peer-deps helps when peer deps cause ERESOLVE.
RUN npm install --legacy-peer-deps

# ---------- build (compile TypeScript) ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- runner (production image with prod deps only) ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install ONLY production dependencies in the final image
COPY package.json package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# compiled output
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

EXPOSE 4000
CMD ["npm", "start"]
