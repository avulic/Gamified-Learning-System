# Production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
RUN npm ci

# Copy tsconfig.json and source files
COPY tsconfig.json ./
COPY ./src ./src

# Install additional type declarations
RUN npm install --save-dev @types/cors @types/jsonwebtoken @types/bcryptjs @types/uuid mongodb-memory-server

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy the production .env file
COPY .env.production ./.env

EXPOSE 4000

CMD ["node", "dist/server.js"]