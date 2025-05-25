import { Injectable } from '@nestjs/common';
import { ReviewPrismaRepository } from '@infrastructure/database/prisma/repositories/review-prisma.repository';
import { Review } from '@domain/review/entities/review.entity';
import { ReviewNotFoundException } from '@domain/review/exceptions/review.exceptions';

@Injectable()
export class GetReviewQuery {
  constructor(private readonly reviewRepo: ReviewPrismaRepository) {}

  async execute(reviewId: number, gameId?: number): Promise<Review> {
    const review = await this.reviewRepo.findByIdAndGameId(reviewId, gameId);

    if (!review || review.deleted) {
      throw new ReviewNotFoundException(
        gameId
          ? `Review ${reviewId} not found for game ${gameId}`
          : `Review ${reviewId} not found`,
      );
    }

    return review;
  }
}
