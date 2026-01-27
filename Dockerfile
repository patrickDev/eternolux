FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy backend
COPY --from=deps /app/server ./server

# Copy frontend
COPY --from=build /app/client/.next ./client/.next
COPY --from=build /app/client/public ./client/public
COPY --from=deps /app/client/package*.json ./client/

# Expose ports
EXPOSE 3000 4000

# Start backend and frontend
CMD sh -c "node server/index.js & npm --prefix client start"
