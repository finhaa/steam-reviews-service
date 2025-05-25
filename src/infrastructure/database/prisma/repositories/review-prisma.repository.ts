import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ReviewRepository } from '../../../../domain/review/repositories/review.repository';
import { Review } from '../../../../domain/review/entities/review.entity';
import { ReviewMapper } from '../mappers/review.mapper';

@Injectable()
export class ReviewPrismaRepository implements ReviewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({ where: { id } });
    return review ? ReviewMapper.toDomain(review) : null;
  }

  async findBySteamId(steamId: string): Promise<Review | null> {
    const review = await this.prisma.review.findUnique({ where: { steamId } });
    return review ? ReviewMapper.toDomain(review) : null;
  }

  async findByGameId(gameId: number): Promise<Review[]> {
    const reviews = await this.prisma.review.findMany({
      where: { gameId, deleted: false },
    });
    return reviews.map((review) => ReviewMapper.toDomain(review));
  }

  async create(review: Review): Promise<Review> {
    const created = await this.prisma.review.create({
      data: {
        steamId: review.steamId,
        gameId: review.gameId,
        authorSteamId: review.authorSteamId,
        recommended: review.recommended,
        content: review.content,
        timestampCreated: review.timestampCreated,
        timestampUpdated: review.timestampUpdated,
        deleted: review.deleted,
      },
    });
    return ReviewMapper.toDomain(created);
  }

  async update(review: Review): Promise<Review> {
    const updated = await this.prisma.review.update({
      where: { steamId: review.steamId },
      data: {
        content: review.content,
        recommended: review.recommended,
        timestampUpdated: review.timestampUpdated,
        deleted: review.deleted,
      },
    });
    return ReviewMapper.toDomain(updated);
  }

  async softDeleteByGameIdNotIn(
    gameId: number,
    steamIds: string[],
  ): Promise<void> {
    await this.prisma.review.updateMany({
      where: {
        gameId,
        steamId: { notIn: steamIds },
        deleted: false,
      },
      data: { deleted: true },
    });
  }
}
