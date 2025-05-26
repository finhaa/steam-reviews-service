import { Injectable, Logger } from '@nestjs/common';
import { ReviewPrismaRepository } from '@infrastructure/database/prisma/repositories/review-prisma.repository';
import { Review } from '@domain/review/entities/review.entity';
import { ReviewQueryException } from '@domain/review/exceptions/review.exceptions';
import { GameNotFoundException } from '@domain/game/exceptions/game.exceptions';
import { GameValidatorService } from '@app/game/services/game-validator.service';

export interface PaginatedReviewsResult {
  reviews: Review[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class ListReviewsQuery {
  private readonly logger = new Logger(ListReviewsQuery.name);

  constructor(
    private readonly gameValidator: GameValidatorService,
    private readonly reviewRepo: ReviewPrismaRepository,
  ) {}

  async execute(
    gameId: number,
    page: number = 1,
    pageSize: number = 20,
  ): Promise<PaginatedReviewsResult> {
    try {
      this.logger.log(
        `Fetching reviews for game ${gameId} (page ${page}, size ${pageSize})`,
      );

      await this.gameValidator.validateAndGetGame(gameId);
      this.validatePaginationParams(page, pageSize);

      const skip = (page - 1) * pageSize;
      const [reviews, total] = await Promise.all([
        this.reviewRepo.findByGameIdPaginated(gameId, skip, pageSize),
        this.reviewRepo.countByGameId(gameId),
      ]);

      const totalPages = Math.ceil(total / pageSize);

      return {
        reviews,
        total,
        page,
        pageSize,
        totalPages,
      };
    } catch (error) {
      this.logger.error(
        `Failed to fetch reviews for game ${gameId} (page ${page}, size ${pageSize}):`,
        error,
      );
      if (error instanceof GameNotFoundException) {
        throw error;
      }
      throw new ReviewQueryException(
        'fetch reviews',
        error instanceof Error ? error.message : 'Unknown error occurred',
        error instanceof Error ? error : undefined,
      );
    }
  }

  private validatePaginationParams(page: number, pageSize: number): void {
    if (!page || page < 1) {
      throw new ReviewQueryException(
        'validate pagination',
        'Page number must be greater than 0',
      );
    }

    if (!pageSize || pageSize < 1) {
      throw new ReviewQueryException(
        'validate pagination',
        'Page size must be greater than 0',
      );
    }

    if (pageSize > 100) {
      throw new ReviewQueryException(
        'validate pagination',
        'Page size cannot exceed 100',
      );
    }
  }
}
