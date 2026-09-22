# Build stage
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install dependencies for building native modules if any (bcrypt, pg)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build admin-api && npm run build public-api && npm run build:seeder

# Production stage
FROM node:20-alpine AS production

WORKDIR /usr/src/app

COPY package*.json ./
# Install only production dependencies
RUN npm install --omit=dev

# Copy built assets
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/resources ./resources

# The default nest start command for production in package.json is 'node dist/apps/admin-api/main'
CMD ["npm", "run", "start:prod"]
