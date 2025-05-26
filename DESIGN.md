# Steam Reviews Service - Design Document

## Overview

This document outlines the design decisions and strategies implemented in the Steam Reviews Service, particularly focusing on how we handle review synchronization with Steam's API.

## Review Synchronization Strategy

### 1. Data Model Design

The service uses two main entities:

#### Game
- Represents a Steam game we're tracking
- Identified by unique Steam App ID
- Contains basic metadata (name)
- One-to-many relationship with reviews

#### Review
- Represents a user review from Steam
- Unique Steam recommendation ID
- Contains review content, rating, timestamps
- Implements soft deletion for removed reviews
- Tracks both creation and update timestamps

### 2. Sync Process Flow

1. **Initial Fetch**
   - Retrieve all reviews for a game from Steam API
   - Use cursor-based pagination to handle large sets
   - Store reviews with original timestamps

2. **Update Detection**
   ```typescript
   if (steamReview.timestamp_updated > existingReview.timestampUpdated) {
     // Review has been modified, update local copy
     await updateReview(steamReview);
   }
   ```

3. **Deletion Handling**
   - Track fetched review IDs during sync
   - Mark reviews not present in API response as deleted
   - Use soft delete to maintain history
   ```typescript
   await softDeleteByGameIdNotIn(gameId, fetchedReviewIds);
   ```

### 3. Error Handling

1. **API Failures**
   - Retry mechanism with exponential backoff
   - Configurable retry attempts and delays
   - Detailed error logging with HTTP exceptions

2. **Data Validation**
   - Input validation using class-validator
   - Schema validation for API responses
   - Proper error responses with status codes

### 4. Performance Considerations

1. **Pagination**
   - Steam API responses use cursor-based pagination
   - Configurable page size via STEAM_PAGE_SIZE env variable (default: 100)
   - Efficient memory usage by processing reviews in chunks

2. **Database Optimization**
   - Batch processing with configurable batch sizes (DB_BATCH_SIZE env variable)
   - Transaction-based batch operations for creates, updates, and deletes
   - Indexed lookups via steamId and appId unique constraints
   - Soft deletes for maintaining review history
   - Chunked processing for large datasets

3. **Rate Limiting & Resilience**
   - Global rate limiting via ThrottlerModule (100 requests/minute)
   - Per-endpoint throttling with @Throttle decorator
   - Exponential backoff strategy for failed requests
   - Configurable backoff parameters:
     - Initial delay (STEAM_BACKOFF_INITIAL_DELAY, default: 1s)
     - Maximum delay (STEAM_BACKOFF_MAX_DELAY, default: 30s)
     - Maximum attempts (STEAM_BACKOFF_MAX_ATTEMPTS, default: 3)

## API Design

### Endpoints

1. **Game Management**
   - POST /games - Register new game
   - GET /games - List registered games

2. **Review Management**
   - POST /games/:id/reviews/fetch - Sync reviews
   - GET /games/:id/reviews - List reviews
   - GET /games/:id/reviews/:reviewId - Get single review

### Response Format

```typescript
// Review Response
{
  id: number;
  steamId: string;
  gameId: number;
  authorSteamId?: string;
  recommended: boolean;
  content: string;
  timestampCreated: Date;
  timestampUpdated?: Date;
  deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Future Improvements

1. **Caching Layer**
   - Implement Redis caching
   - Cache frequently accessed reviews
   - Cache Steam API responses

2. **Background Processing**
   - Move sync to background job
   - Implement job queue
   - Progress tracking

3. **Analytics**
   - Track sync statistics
   - Monitor review changes
   - Generate insights

4. **API Extensions**
   - Filtering and sorting
   - Pagination
   - Full-text search

## Security Considerations

1. **Rate Limiting**
   - Implement API rate limiting
   - Use Steam API key securely
   - Protect sensitive endpoints

2. **Data Validation**
   - Sanitize user inputs
   - Validate Steam API responses
   - Handle malformed data

3. **Error Handling**
   - Don't expose internal errors
   - Proper status codes
   - Detailed logging 