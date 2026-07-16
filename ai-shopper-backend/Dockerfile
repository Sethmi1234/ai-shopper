# ---- Build Stage ----
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# ---- Production Stage ----
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist

# Expose backend port
EXPOSE 5000

# Start the application
CMD ["node", "dist/server.js"]