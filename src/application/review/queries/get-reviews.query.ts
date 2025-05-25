import { Injectable, NotFoundException } from '@nestjs/common';
import { ReviewPrismaRepository } from '@infrastructure/database/prisma/repositories/review-prisma.repository';
import { Review } from '@domain/review/entities/review.entity';

@Injectable()
export class GetReviewQuery {
  constructor(private readonly reviewRepo: ReviewPrismaRepository) {}

  async execute(gameId: number, reviewId: number): Promise<Review> {
    const review = await this.reviewRepo.findById(reviewId);
    if (!review || review.gameId !== gameId || review.deleted) {
      throw new NotFoundException('Review not found.');
    }
    return review;
  }
}
