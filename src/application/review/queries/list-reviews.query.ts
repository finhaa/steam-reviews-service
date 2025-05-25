import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { ReviewPrismaRepository } from '../../../infrastructure/database/prisma/repositories/review-prisma.repository';
import { Review } from '../../../domain/review/entities/review.entity';
import { ReviewQueryException } from '../../../domain/review/exceptions/review.exceptions';

@Injectable()
export class ListReviewsQuery {
  private readonly logger = new Logger(ListReviewsQuery.name);

  constructor(
    private readonly gameRepo: GamePrismaRepository,
    private readonly reviewRepo: ReviewPrismaRepository,
  ) {}

  async execute(gameId: number): Promise<Review[]> {
    try {
      this.logger.log(`Fetching reviews for game ${gameId}`);

      if (!gameId || isNaN(gameId)) {
        throw new ReviewQueryException(
          'list reviews',
          'Invalid game ID provided',
        );
      }

      const game = await this.gameRepo.findById(gameId);
      if (!game) {
        this.logger.warn(`Game not found with ID ${gameId}`);
        throw new NotFoundException(`Game with ID ${gameId} not found`);
      }

      const reviews = await this.reviewRepo.findByGameId(gameId);
      this.logger.log(`Found ${reviews.length} reviews for game ${gameId}`);

      return reviews;
    } catch (error) {
      this.logger.error(
        `Error fetching reviews for game ${gameId}:`,
        error instanceof Error ? error.stack : error,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof ReviewQueryException
      ) {
        throw error;
      }

      throw new ReviewQueryException(
        'list reviews',
        'Failed to fetch reviews',
        error instanceof Error ? error : undefined,
      );
    }
  }
}
