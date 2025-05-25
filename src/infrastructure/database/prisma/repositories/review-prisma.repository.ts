import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { ReviewRepository } from '@domain/review/repositories/review.repository';
import { Review } from '@domain/review/entities/review.entity';
import { ReviewMapper } from '@infrastructure/database/prisma/mappers/review.mapper';
import {
  ReviewBatchOperationException,
  ReviewNotFoundException,
  ReviewOperationException,
  ReviewDuplicateException,
} from '@domain/review/exceptions/review.exceptions';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewPrismaRepository implements ReviewRepository {
  private readonly batchSize: number;
  private readonly logger = new Logger(ReviewPrismaRepository.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.batchSize =
      this.configService.get('performance.database.batchSize') ?? 100;
  }

  async findById(id: number): Promise<Review | null> {
    try {
      const review = await this.prisma.review.findUnique({ where: { id } });
      return review ? ReviewMapper.toDomain(review) : null;
    } catch (error) {
      this.logger.error(`Failed to find review by ID ${id}:`, error);
      throw new ReviewOperationException(
        'find',
        `Failed to find review by ID ${id}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findBySteamId(steamId: string): Promise<Review | null> {
    try {
      const review = await this.prisma.review.findUnique({
        where: { steamId },
      });
      return review ? ReviewMapper.toDomain(review) : null;
    } catch (error) {
      this.logger.error(`Failed to find review by Steam ID ${steamId}:`, error);
      throw new ReviewOperationException(
        'find',
        `Failed to find review by Steam ID ${steamId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findByGameId(gameId: number): Promise<Review[]> {
    try {
      const reviews = await this.prisma.review.findMany({
        where: { gameId, deleted: false },
      });
      return reviews.map((review) => ReviewMapper.toDomain(review));
    } catch (error) {
      this.logger.error(`Failed to find reviews for game ${gameId}:`, error);
      throw new ReviewOperationException(
        'find',
        `Failed to find reviews for game ${gameId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async create(review: Review): Promise<Review> {
    try {
      const created = await this.prisma.review.create({
        data: ReviewMapper.toPrisma(review, true),
      });
      return ReviewMapper.toDomain(created);
    } catch (error) {
      this.logger.error(
        `Failed to create review for Steam ID ${review.steamId}:`,
        error,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ReviewDuplicateException(review.steamId, error);
        }
      }
      throw new ReviewOperationException(
        'create',
        `Failed to create review for Steam ID ${review.steamId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async update(review: Review): Promise<Review> {
    try {
      const updated = await this.prisma.review.update({
        where: { steamId: review.steamId },
        data: ReviewMapper.toPrisma(review),
      });
      return ReviewMapper.toDomain(updated);
    } catch (error) {
      this.logger.error(
        `Failed to update review for Steam ID ${review.steamId}:`,
        error,
      );
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new ReviewNotFoundException(review.steamId, error);
        }
      }
      throw new ReviewOperationException(
        'update',
        `Failed to update review for Steam ID ${review.steamId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async batchCreate(reviews: Review[]): Promise<void> {
    try {
      const chunks = this.chunkArray(reviews, this.batchSize);

      for (const chunk of chunks) {
        await this.prisma.$transaction(
          chunk.map((review) =>
            this.prisma.review.create({
              data: ReviewMapper.toPrisma(review, true),
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.error('Failed to batch create reviews:', error);
      throw new ReviewBatchOperationException(
        'create',
        `Failed to create ${reviews.length} reviews`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async batchUpdate(reviews: Review[]): Promise<void> {
    try {
      const chunks = this.chunkArray(reviews, this.batchSize);

      for (const chunk of chunks) {
        await this.prisma.$transaction(
          chunk.map((review) =>
            this.prisma.review.update({
              where: { steamId: review.steamId },
              data: ReviewMapper.toPrisma(review),
            }),
          ),
        );
      }
    } catch (error) {
      this.logger.error('Failed to batch update reviews:', error);
      throw new ReviewBatchOperationException(
        'update',
        `Failed to update ${reviews.length} reviews`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async softDeleteByGameIdNotIn(
    gameId: number,
    steamIds: string[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Marking reviews as deleted for game ${gameId} that are not in the set of ${steamIds.length} Steam IDs`,
      );

      const reviewsToDelete = await this.prisma.review.findMany({
        where: {
          gameId,
          steamId: { notIn: steamIds },
          deleted: false,
        },
        select: {
          id: true,
          steamId: true,
        },
      });

      if (reviewsToDelete.length === 0) {
        this.logger.log('No reviews need to be marked as deleted');
        return;
      }

      this.logger.log(
        `Found ${reviewsToDelete.length} reviews to mark as deleted`,
      );

      const chunks = this.chunkArray(
        reviewsToDelete.map((r) => r.id),
        this.batchSize,
      );

      for (const chunk of chunks) {
        await this.prisma.review.updateMany({
          where: {
            id: { in: chunk },
            deleted: false,
          },
          data: { deleted: true },
        });
      }

      this.logger.log(
        `Successfully marked ${reviewsToDelete.length} reviews as deleted for game ${gameId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to soft delete reviews for game ${gameId}:`,
        error,
      );
      throw new ReviewBatchOperationException(
        'soft delete',
        `Failed to soft delete reviews for game ${gameId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
