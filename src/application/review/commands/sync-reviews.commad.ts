import { Injectable, NotFoundException } from '@nestjs/common';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { ReviewPrismaRepository } from '../../../infrastructure/database/prisma/repositories/review-prisma.repository';
import { SteamApiService } from '../../../infrastructure/external/steam-api.service';
import { Review } from '../../../domain/review/entities/review.entity';

@Injectable()
export class SyncReviewsCommand {
  constructor(
    private readonly gameRepo: GamePrismaRepository,
    private readonly reviewRepo: ReviewPrismaRepository,
    private readonly steamApi: SteamApiService,
  ) {}

  async execute(gameId: number): Promise<{ message: string }> {
    const game = await this.gameRepo.findById(gameId);
    if (!game) throw new NotFoundException('Game not found.');

    const steamReviews = await this.steamApi.fetchAllReviews(game.appId);
    const fetchedIds = new Set<string>();

    for (const r of steamReviews) {
      fetchedIds.add(r.recommendationid);

      const existing = await this.reviewRepo.findBySteamId(r.recommendationid);
      if (!existing) {
        await this.reviewRepo.create(
          new Review(
            0,
            r.recommendationid,
            game.id,
            r.author?.steamid || null,
            r.voted_up,
            r.review,
            new Date(r.timestamp_created * 1000),
            new Date(r.timestamp_updated * 1000),
            false,
            new Date(),
            new Date(),
          ),
        );
      } else {
        if (
          r.timestamp_updated >
          (existing.timestampUpdated
            ? Math.floor(existing.timestampUpdated.getTime() / 1000)
            : r.timestamp_created)
        ) {
          await this.reviewRepo.update(
            new Review(
              existing.id,
              r.recommendationid,
              game.id,
              r.author?.steamid || null,
              r.voted_up,
              r.review,
              new Date(r.timestamp_created * 1000),
              new Date(r.timestamp_updated * 1000),
              false,
              existing.createdAt,
              new Date(),
            ),
          );
        }
      }
    }

    await this.reviewRepo.softDeleteByGameIdNotIn(
      game.id,
      Array.from(fetchedIds),
    );

    return {
      message: `Reviews synchronized: fetched ${steamReviews.length} reviews.`,
    };
  }
}
