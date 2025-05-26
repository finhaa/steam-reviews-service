import { Injectable, Logger } from '@nestjs/common';
import { SteamApiService } from '@infrastructure/external/steam-api/steam-api.service';
import { Review } from '@domain/review/entities/review.entity';
import { ReviewPrismaRepository } from '@infrastructure/database/prisma/repositories/review-prisma.repository';
import { InvalidReviewDataException } from '@domain/review/exceptions/review.exceptions';
import { SteamReview } from '@infrastructure/external/steam-api/interfaces/steam-review.interface';

@Injectable()
export class ReviewSyncService {
  private readonly logger = new Logger(ReviewSyncService.name);

  constructor(
    private readonly reviewRepo: ReviewPrismaRepository,
    private readonly steamApi: SteamApiService,
  ) {}

  async syncGameReviews(gameId: number, appId: number): Promise<number> {
    const fetchedIds = new Set<string>();
    let processedCount = 0;
    let cursor = '*';

    while (cursor) {
      const { reviews: steamReviews, nextCursor } =
        await this.steamApi.fetchReviewPage(appId, cursor);

      if (steamReviews.length === 0) {
        break;
      }

      const { reviewsToCreate, reviewsToUpdate } = await this.processReviews(
        gameId,
        steamReviews,
        fetchedIds,
      );

      await this.persistChanges(gameId, reviewsToCreate, reviewsToUpdate);

      processedCount += steamReviews.length;
      this.logger.log(
        `Processed ${processedCount} reviews so far for game ${gameId}`,
      );

      if (!nextCursor) {
        break;
      }

      cursor = nextCursor;
    }

    await this.reviewRepo.softDeleteByGameIdNotIn(
      gameId,
      Array.from(fetchedIds),
    );
    return processedCount;
  }

  private async processReviews(
    gameId: number,
    steamReviews: SteamReview[],
    fetchedIds: Set<string>,
  ): Promise<{
    reviewsToCreate: Review[];
    reviewsToUpdate: Review[];
  }> {
    const reviewsToCreate: Review[] = [];
    const reviewsToUpdate: Review[] = [];

    for (const review of steamReviews) {
      try {
        if (!this.isValidSteamReview(review)) {
          this.logger.warn('Skipping invalid review');
          continue;
        }

        if (!review.recommendationid) {
          this.logger.warn('Skipping review with missing recommendationid');
          continue;
        }

        fetchedIds.add(review.recommendationid);

        const existing = await this.reviewRepo.findBySteamId(
          review.recommendationid,
        );
        const timestampCreated = this.validateTimestamp(
          review.timestamp_created,
        );
        const timestampUpdated = this.validateTimestamp(
          review.timestamp_updated,
        );

        const reviewEntity = new Review(
          existing?.id ?? undefined,
          review.recommendationid,
          gameId,
          review.author?.steamid || null,
          review.voted_up,
          review.review || '',
          timestampCreated,
          timestampUpdated,
          false,
          existing?.createdAt ?? new Date(),
          new Date(),
        );

        if (!existing) {
          reviewsToCreate.push(reviewEntity);
        } else if (
          review.timestamp_updated >
          (existing.timestampUpdated
            ? Math.floor(existing.timestampUpdated.getTime() / 1000)
            : review.timestamp_created)
        ) {
          reviewsToUpdate.push(reviewEntity);
        }
      } catch (error) {
        this.logger.error(
          `Error processing review ${review?.recommendationid ?? 'unknown'}:`,
          error,
        );
        continue;
      }
    }

    this.logger.log(
      `Processing ${reviewsToCreate.length} creates and ${reviewsToUpdate.length} updates`,
    );
    return { reviewsToCreate, reviewsToUpdate };
  }

  private isValidSteamReview(review: unknown): review is SteamReview {
    return (
      typeof review === 'object' &&
      review !== null &&
      'recommendationid' in review &&
      'timestamp_created' in review &&
      'timestamp_updated' in review &&
      'author' in review &&
      'voted_up' in review &&
      'review' in review
    );
  }

  private async persistChanges(
    gameId: number,
    reviewsToCreate: Review[],
    reviewsToUpdate: Review[],
  ): Promise<void> {
    if (reviewsToCreate.length > 0) {
      await this.reviewRepo.batchCreate(reviewsToCreate);
    }

    if (reviewsToUpdate.length > 0) {
      await this.reviewRepo.batchUpdate(reviewsToUpdate);
    }
  }

  private validateTimestamp(timestamp: number): Date {
    if (!timestamp || isNaN(timestamp)) {
      throw new InvalidReviewDataException('Invalid timestamp');
    }
    const date = new Date(timestamp * 1000);
    if (isNaN(date.getTime())) {
      throw new InvalidReviewDataException('Invalid date from timestamp');
    }
    return date;
  }
}
