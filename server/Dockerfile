# STAGE 1: Install Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --legacy-peer-deps

# STAGE 2: Build the TypeScript
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# This creates the 'dist' folder seen in your screenshot
RUN npm run build

# STAGE 3: Production Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000

COPY package.json package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps && npm cache clean --force

# Copy only the compiled code
COPY --from=build /app/dist ./dist

EXPOSE 4000

# Start using the compiled entry point
CMD ["node", "dist/index.js"]