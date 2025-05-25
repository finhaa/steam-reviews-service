import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { ReviewPrismaRepository } from '../../../infrastructure/database/prisma/repositories/review-prisma.repository';
import { SteamApiService } from '../../../infrastructure/external/steam-api.service';
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

      // Validate and fetch game
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

      this.logger.log(`Fetching reviews for Steam app ID ${game.appId}`);
      const steamReviews = await this.steamApi.fetchAllReviews(game.appId);

      if (!Array.isArray(steamReviews)) {
        throw new ReviewSyncException('Invalid response from Steam API');
      }

      const fetchedIds = new Set<string>();
      const reviewsToCreate: Review[] = [];
      const reviewsToUpdate: Review[] = [];

      for (const r of steamReviews) {
        try {
          if (!r.recommendationid) {
            this.logger.warn('Skipping review with missing recommendationid');
            continue;
          }

          fetchedIds.add(r.recommendationid);

          const existing = await this.reviewRepo.findBySteamId(
            r.recommendationid,
          );

          const timestampCreated = this.validateTimestamp(r.timestamp_created);
          const timestampUpdated = this.validateTimestamp(r.timestamp_updated);

          const review = new Review(
            existing?.id ?? 0,
            r.recommendationid,
            game.id,
            r.author?.steamid || null,
            r.voted_up,
            r.review || '',
            timestampCreated,
            timestampUpdated,
            false,
            existing?.createdAt ?? new Date(),
            new Date(),
          );

          if (!existing) {
            reviewsToCreate.push(review);
          } else if (
            r.timestamp_updated >
            (existing.timestampUpdated
              ? Math.floor(existing.timestampUpdated.getTime() / 1000)
              : r.timestamp_created)
          ) {
            reviewsToUpdate.push(review);
          }
        } catch (error) {
          this.logger.error(
            `Error processing review ${r.recommendationid}:`,
            error,
          );
          continue;
        }
      }

      this.logger.log(
        `Processing ${reviewsToCreate.length} creates and ${reviewsToUpdate.length} updates`,
      );

      if (reviewsToCreate.length > 0) {
        await this.reviewRepo.batchCreate(reviewsToCreate);
      }

      if (reviewsToUpdate.length > 0) {
        await this.reviewRepo.batchUpdate(reviewsToUpdate);
      }

      await this.reviewRepo.softDeleteByGameIdNotIn(
        game.id,
        Array.from(fetchedIds),
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
