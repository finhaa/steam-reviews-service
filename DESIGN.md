# Technical Design Document

## Architecture Overview

The Steam Reviews Service is built following Domain-Driven Design (DDD) and Clean Architecture principles, organized into distinct layers:

### 1. Domain Layer (`src/domain/`)
- Contains core business logic and entities
- Independent of external dependencies
- Defines interfaces for repositories and services

### 2. Application Layer (`src/app/`)
- Implements use cases using domain entities
- Orchestrates domain objects to perform tasks
- Contains command and query handlers

### 3. Infrastructure Layer (`src/infrastructure/`)
- Provides implementations for interfaces defined in domain layer
- Handles external service integrations
- Manages database access and caching

### 4. Interface Layer (`src/interfaces/`)
- Contains API controllers and DTOs
- Handles HTTP request/response cycle
- Implements input validation

## Key Components

### Steam API Integration (`src/infrastructure/external/steam-api/`)

1. **Interface Organization**
   - `steam-app.interface.ts`: Game-related interfaces
   - `steam-review.interface.ts`: Review-related interfaces
   - `steam-search.interface.ts`: Search-related interfaces

2. **Service Implementation**
   - Rate limiting with @nestjs/throttler
   - Retry mechanism for failed requests
   - Error handling and logging

### Review Sync Process

1. **Architecture**
   ```
   HTTP Request → GameReviewController → ReviewQueueService
        ↓
   Bull Queue → ReviewSyncProcessor → SyncReviewsCommand
        ↓
   ReviewSyncService → SteamApiService + ReviewPrismaRepository
   ```

2. **Flow Description**
   - User initiates sync via `POST /games/:gameId/reviews/sync`
   - Request is queued in Redis using Bull for background processing
   - Queue processor executes the sync command
   - Reviews are fetched from Steam API using cursor-based pagination
   - Reviews are processed in batches for create/update operations
   - Missing reviews are soft-deleted

3. **Key Components**
   - `ReviewQueueService`: Manages background job queue
   - `ReviewSyncProcessor`: Processes queued sync jobs
   - `SyncReviewsCommand`: Orchestrates the sync operation
   - `ReviewSyncService`: Core sync logic implementation
   - `SteamApiService`: Steam API communication
   - `ReviewPrismaRepository`: Database operations

4. **Sync Process Details**
   ```typescript
   // 1. Queue job
   POST /games/:gameId/reviews/sync → Returns jobId

   // 2. Monitor progress
   GET /games/:gameId/reviews/sync/:jobId/status

   // 3. Sync Process
   while (hasCursor) {
     // Fetch page of reviews from Steam
     const { reviews, nextCursor } = await fetchReviewPage(appId, cursor);
     
     // Process reviews
     const { reviewsToCreate, reviewsToUpdate } = await processReviews(reviews);
     
     // Batch database operations
     await batchCreate(reviewsToCreate);
     await batchUpdate(reviewsToUpdate);
     
     cursor = nextCursor;
   }
   
   // 4. Cleanup
   await softDeleteMissingReviews();
   ```

5. **Error Handling**
   - Job retry with exponential backoff
   - Validation of review data
   - Transaction-based batch operations
   - Detailed error logging
   - Error response standardization

### Data Models

1. **Game Entity**
   - Steam App ID and metadata
   - Game details (name, description, images)
   - Platform support
   - Categories and genres

2. **Review Entity**
   - Steam recommendation ID
   - Author information
   - Review content and rating
   - Timestamps for creation/updates

## Performance Optimizations

1. **Rate Limiting**
   - Global rate limits for Steam API
   - Per-endpoint throttling
   - Redis-based rate limiter

2. **Database Optimizations**
   - Batch processing for reviews
   - Efficient indexing
   - Soft deletes for reviews

## Error Handling

1. **Types of Errors**
   - Steam API errors
   - Database errors
   - Validation errors
   - Not found errors

2. **Error Response Format**
   ```typescript
   {
     statusCode: number;
     message: string;
     error: string;
     details?: any;
   }
   ```

## Security Considerations

1. **API Security**
   - Rate limiting to prevent abuse
   - Input validation
   - Error message sanitization

2. **Data Security**
   - No sensitive data storage
   - Soft delete for data preservation
   - Database access controls

## Future Improvements

1. **Scalability**
   - Implement event-driven architecture
   - Horizontal scaling support

2. **Features**
   - Review analytics
   - User sentiment analysis
   - Review moderation system

3. **Monitoring**
   - Add metrics collection
   - Implement tracing
   - Enhanced logging

## Dependencies

### Core Dependencies
- NestJS: NodeJS API framework
- Prisma: Database ORM
- Redis: Background jobs
- PostgreSQL: Primary database

### Development Dependencies
- TypeScript
- ESLint
- Docker for containerization 