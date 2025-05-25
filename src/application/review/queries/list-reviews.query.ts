import { Injectable, NotFoundException } from '@nestjs/common';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { ReviewPrismaRepository } from '../../../infrastructure/database/prisma/repositories/review-prisma.repository';
import { Review } from '../../../domain/review/entities/review.entity';

@Injectable()
export class ListReviewsQuery {
  constructor(
    private readonly gameRepo: GamePrismaRepository,
    private readonly reviewRepo: ReviewPrismaRepository,
  ) {}

  async execute(gameId: number): Promise<Review[]> {
    const game = await this.gameRepo.findById(gameId);
    if (!game) throw new NotFoundException('Game not found.');

    return this.reviewRepo.findByGameId(gameId);
  }
}
