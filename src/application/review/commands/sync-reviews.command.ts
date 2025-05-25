import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { ReviewPrismaRepository } from '../../../infrastructure/database/prisma/repositories/review-prisma.repository';
import {
  SteamApiService,
  SteamReview,
} from '../../../infrastructure/external/steam-api.service';
import { Review } from '../../../domain/review/entities/review.entity';
import { Game } from '../../../domain/game/entities/game.entity';
import {
  InvalidReviewDataException,
  ReviewSyncException,
} from '../../../domain/review/exceptions/review.exceptions';

@Injectable()
export class SyncReviewsCommand {
  private readonly logger = new Logger(SyncReviewsCommand.name);

  constructor(
    private readonly gameRepo: GamePrismaRepository,
    private readonly reviewRepo: ReviewPrismaRepository,
    private readonly steamApi: SteamApiService,
  ) {}

  async execute(gameId: number): Promise<{ message: string }> {
    try {
      this.logger.log(`Starting review sync for game ${gameId}`);

      const game = await this.validateAndGetGame(gameId);
      const steamReviews = await this.fetchAndValidateSteamReviews(game.appId);
      const { reviewsToCreate, reviewsToUpdate, fetchedIds } =
        await this.processReviews(game.id, steamReviews);
      await this.persistChanges(
        game.id,
        reviewsToCreate,
        reviewsToUpdate,
        fetchedIds,
      );

      const message = `Reviews synchronized successfully: created ${reviewsToCreate.length}, updated ${reviewsToUpdate.length} reviews.`;
      this.logger.log(message);
      return { message };
    } catch (error) {
      this.logger.error(`Failed to sync reviews for game ${gameId}:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof InvalidReviewDataException
      ) {
        throw error;
      }
      throw new ReviewSyncException(
        error instanceof Error ? error.message : 'Unknown error occurred',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private async validateAndGetGame(gameId: number): Promise<Game> {
    if (!gameId || isNaN(gameId)) {
      throw new InvalidReviewDataException('Invalid game ID provided');
    }

    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }
    if (!(game instanceof Game) || typeof game.appId !== 'number') {
      throw new InvalidReviewDataException(
        'Invalid game data retrieved from database',
      );
    }

    return game;
  }

  private async fetchAndValidateSteamReviews(
    appId: number,
  ): Promise<SteamReview[]> {
    this.logger.log(`Fetching reviews for Steam app ID ${appId}`);
    const steamReviews = await this.steamApi.fetchAllReviews(appId);

    if (!Array.isArray(steamReviews)) {
      throw new ReviewSyncException('Invalid response from Steam API');
    }

    return steamReviews;
  }

  private async processReviews(
    gameId: number,
    steamReviews: SteamReview[],
  ): Promise<{
    reviewsToCreate: Review[];
    reviewsToUpdate: Review[];
    fetchedIds: Set<string>;
  }> {
    const fetchedIds = new Set<string>();
    const reviewsToCreate: Review[] = [];
    const reviewsToUpdate: Review[] = [];

    for (const review of steamReviews) {
      try {
        if (!this.isValidSteamReview(review)) {
          this.logger.warn('Skipping invalid review');
          continue;
        }
        await this.processReview(review, gameId, {
          fetchedIds,
          reviewsToCreate,
          reviewsToUpdate,
        });
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
    return { reviewsToCreate, reviewsToUpdate, fetchedIds };
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

  private async processReview(
    steamReview: SteamReview,
    gameId: number,
    collections: {
      fetchedIds: Set<string>;
      reviewsToCreate: Review[];
      reviewsToUpdate: Review[];
    },
  ): Promise<void> {
    if (!steamReview.recommendationid) {
      this.logger.warn('Skipping review with missing recommendationid');
      return;
    }

    collections.fetchedIds.add(steamReview.recommendationid);

    const existing = await this.reviewRepo.findBySteamId(
      steamReview.recommendationid,
    );
    const timestampCreated = this.validateTimestamp(
      steamReview.timestamp_created,
    );
    const timestampUpdated = this.validateTimestamp(
      steamReview.timestamp_updated,
    );

    const review = new Review(
      existing?.id ?? 0,
      steamReview.recommendationid,
      gameId,
      steamReview.author?.steamid || null,
      steamReview.voted_up,
      steamReview.review || '',
      timestampCreated,
      timestampUpdated,
      false,
      existing?.createdAt ?? new Date(),
      new Date(),
    );

    if (!existing) {
      collections.reviewsToCreate.push(review);
    } else if (
      steamReview.timestamp_updated >
      (existing.timestampUpdated
        ? Math.floor(existing.timestampUpdated.getTime() / 1000)
        : steamReview.timestamp_created)
    ) {
      collections.reviewsToUpdate.push(review);
    }
  }

  private async persistChanges(
    gameId: number,
    reviewsToCreate: Review[],
    reviewsToUpdate: Review[],
    fetchedIds: Set<string>,
  ): Promise<void> {
    if (reviewsToCreate.length > 0) {
      await this.reviewRepo.batchCreate(reviewsToCreate);
    }

    if (reviewsToUpdate.length > 0) {
      await this.reviewRepo.batchUpdate(reviewsToUpdate);
    }

    await this.reviewRepo.softDeleteByGameIdNotIn(
      gameId,
      Array.from(fetchedIds),
    );
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
