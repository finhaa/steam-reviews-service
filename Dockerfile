# Build stage
FROM node:20-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy package files
COPY pnpm-lock.yaml ./
COPY package.json ./
COPY prisma ./prisma/

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

# Set environment variables
ENV SHELL=/bin/sh
ENV PNPM_HOME="/home/nestjs/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Create a non-root user first
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs && \
    mkdir -p /home/nestjs/.local/share/pnpm && \
    chown -R nestjs:nodejs /home/nestjs

# Install system dependencies
RUN apk add --no-cache netcat-openbsd

# Set up pnpm and Prisma for nestjs user
RUN mkdir -p /usr/local/share/pnpm && \
    chown -R nestjs:nodejs /usr/local/share/pnpm && \
    chmod 775 /usr/local/share/pnpm && \
    chown -R nestjs:nodejs /usr/local/bin

USER nestjs
RUN corepack enable && \
    corepack prepare pnpm@latest --activate && \
    pnpm add -g prisma

WORKDIR /app

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/prisma ./prisma
COPY scripts/start.sh ./start.sh

# Install production dependencies only
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --prod --frozen-lockfile

# Generate Prisma client in production
ENV NODE_ENV production
RUN pnpm prisma generate

# Set permissions
USER root
RUN chown -R nestjs:nodejs /app && \
    chmod +x /app/start.sh

USER nestjs

# Expose port
EXPOSE 3000

# Start the application using our script
CMD ["/app/start.sh"] 