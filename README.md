# Steam Reviews Service

A backend service that fetches and manages Steam game reviews, built with NestJS, Prisma, and PostgreSQL, following **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

## Features

- Fetch user reviews for Steam games using Steam's public API
- Persist reviews in PostgreSQL database using Prisma
- Track and handle review updates and deletions
- RESTful API for game and review management
- Swagger API documentation
- Built with a scalable DDD architecture
- Performance optimizations:
  - Batch processing for database operations
  - Rate limiting and throttling
  - Exponential backoff for API failures
  - Cursor-based pagination

## Tech Stack

- Node.js (v20+)
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL
- Docker + Docker Compose
- Swagger for API docs
- Class-validator for validation

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd steam-reviews-service
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env file
cp .env.example .env

# Required environment variables
DATABASE_URL="postgresql://user:password@localhost:5432/steam_reviews_db"

# Optional performance tuning (defaults shown)
STEAM_PAGE_SIZE=100                    # Number of reviews per API request
STEAM_RATE_LIMIT_TTL=60000            # Rate limit window in milliseconds
STEAM_RATE_LIMIT_REQUESTS=100         # Maximum requests per window
STEAM_BACKOFF_INITIAL_DELAY=1000      # Initial retry delay in milliseconds
STEAM_BACKOFF_MAX_DELAY=30000         # Maximum retry delay in milliseconds
STEAM_BACKOFF_MAX_ATTEMPTS=3          # Maximum retry attempts
DB_BATCH_SIZE=100                     # Database batch operation size
```

4. Set up the database:
```bash
# Run database migrations
pnpm prisma migrate deploy

# Generate Prisma client
pnpm prisma generate
```

## Running the Application

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

The server will start at `http://localhost:3000` by default.

## API Documentation

Once the server is running, visit `http://localhost:3000/api` for Swagger documentation.

### Example API Requests

#### 1. Register a Game
```bash
curl -X POST http://localhost:3000/games \
  -H "Content-Type: application/json" \
  -d '{"appId": 570, "name": "Dota 2"}'
```

#### 2. List All Games
```bash
curl http://localhost:3000/games
```

#### 3. Fetch Reviews for a Game
```bash
curl -X POST http://localhost:3000/games/1/reviews/fetch
```

#### 4. List Reviews for a Game
```bash
curl http://localhost:3000/games/1/reviews
```

#### 5. Get a Specific Review
```bash
curl http://localhost:3000/games/1/reviews/1
```

## Performance Features

### 1. Rate Limiting
The service implements rate limiting to prevent API abuse and ensure stable operation:
- Global rate limit: 100 requests per minute
- Per-endpoint throttling where needed
- Configurable via environment variables

### 2. Batch Processing
Database operations are optimized using batch processing:
- Bulk create/update/delete operations
- Configurable batch sizes
- Transaction-based for data consistency

### 3. Error Resilience
Robust error handling with:
- Exponential backoff for failed requests
- Configurable retry parameters
- Proper error reporting and logging

### 4. Pagination
Efficient data handling through:
- Cursor-based pagination for Steam API requests
- Configurable page sizes
- Memory-efficient processing

## Review Sync Strategy

The service implements a robust strategy for keeping reviews synchronized with Steam:

1. **Identification**
   - Each review is uniquely identified by its Steam recommendation ID
   - Reviews are associated with games via Steam App ID

2. **Update Detection**
   - Reviews are compared using Steam's timestamp_updated field
   - If a review's content or rating changes, the local copy is updated
   - Original creation timestamp is preserved while update timestamp reflects changes

3. **Deletion Handling**
   - Uses soft delete strategy
   - When a review is no longer present in Steam's API response, it's marked as deleted
   - Deleted reviews are preserved in the database but filtered from regular queries

4. **Sync Process**
   - Fetches all reviews for a game from Steam
   - Compares against existing reviews in database
   - Updates modified reviews
   - Marks missing reviews as deleted
   - Creates new reviews as needed

## Database Schema

### Game Table
```prisma
model Game {
  id        Int      @id @default(autoincrement())
  appId     Int      @unique
  name      String?
  reviews   Review[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Review Table
```prisma
model Review {
  id               Int       @id @default(autoincrement())
  steamId          String    @unique
  game             Game      @relation(fields: [gameId], references: [id])
  gameId           Int
  authorSteamId    String?
  recommended      Boolean
  content          String
  timestampCreated DateTime
  timestampUpdated DateTime?
  deleted          Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}
```

## Error Handling

The service implements comprehensive error handling:

- Invalid Steam App IDs
- Network failures when fetching reviews
- Database constraints violations
- Invalid input validation
- Not found resources

All errors return appropriate HTTP status codes and descriptive messages.
