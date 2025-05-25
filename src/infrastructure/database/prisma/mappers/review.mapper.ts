import { Review as PrismaReview } from '@prisma/client';
import { Review } from '@domain/review/entities/review.entity';

export class ReviewMapper {
  static toDomain(prismaReview: PrismaReview): Review {
    return new Review(
      prismaReview.id,
      prismaReview.steamId,
      prismaReview.gameId,
      prismaReview.authorSteamId,
      prismaReview.recommended,
      prismaReview.content,
      prismaReview.timestampCreated,
      prismaReview.timestampUpdated,
      prismaReview.deleted,
      prismaReview.createdAt,
      prismaReview.updatedAt,
    );
  }

  static toPrisma(
    review: Review,
    isNew = false,
  ): Omit<PrismaReview, 'id'> | PrismaReview {
    const prismaReview = {
      steamId: review.steamId,
      gameId: review.gameId,
      authorSteamId: review.authorSteamId,
      recommended: review.recommended,
      content: review.content,
      timestampCreated: review.timestampCreated,
      timestampUpdated: review.timestampUpdated,
      deleted: review.deleted,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };

    return isNew ? prismaReview : { ...prismaReview, id: review.id };
  }
}
