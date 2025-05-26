# Steam Reviews Service

A NestJS service that synchronizes and manages Steam game reviews, providing a clean API to access and manage game information and user reviews.

## Features

- Fetch and sync game details from Steam
- Synchronize game reviews with pagination support
- Rate limiting and retry mechanisms for Steam API calls
- Docker support for easy deployment
- PostgreSQL for data persistence

## Prerequisites

- Node.js 20.x or Docker
- PostgreSQL 16.x (if running locally)
- Redis 7.x (if running locally)

## Running with Docker

The easiest way to run the entire stack is using Docker Compose:

```bash
# Build and start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

## Local Development Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start PostgreSQL and Redis (if running locally)

4. Run database migrations:
```bash
# Run database migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

5. Start the development server:
```bash
pnpm run start:dev
```

## API Endpoints

### Games

- `POST /games` - Register a new game
  - Body: `{ "appId": number }`

- `GET /games` - List registered games
  - Query params: `page`, `limit`

- `GET /games/search` - Search games on Steam
  - Query params: `query`

### Reviews

- `GET /games/:gameId/reviews` - Get reviews for a game
  - Query params: `page`, `limit`

- `POST /games/:gameId/reviews/sync` - Trigger review sync for a game

- `GET /games/:gameId/reviews/sync/:jobId/status` - Get status for a job

- `GET /reviews/:reviewId` - Get Specific review

## Project Structure

```
src/
├── app/                    # Application layer
│   ├── game/              # Game module
│   └── review/            # Review module
├── domain/                # Domain layer
│   ├── game/             # Game domain
│   └── review/           # Review domain
├── infrastructure/        # Infrastructure layer
│   ├── database/         # Database configurations
│   ├── external/         # External services
│   │   └── steam-api/    # Steam API integration
│   └── services/         # Shared services
│   └── queue/            # Queue
└── interfaces/           # Interface layer
    └── rest/             # REST API controllers
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection URL | - |
| REDIS_HOST | Redis host | localhost |
| REDIS_PORT | Redis port | 6379 |
| STEAM_PAGE_SIZE | Reviews per page | 100 |
| STEAM_RATE_LIMIT_TTL | Rate limit window (ms) | 60000 |
| STEAM_RATE_LIMIT_REQUESTS | Requests per window | 100 |

## License

This project is licensed under the MIT License - see the LICENSE file for details.
