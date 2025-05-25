import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../../infrastructure/database/database.module';
import { SteamApiService } from '../../../infrastructure/external/steam-api.service';
import { ReviewController } from './review.controller';
import { SyncReviewsCommand } from '../../../application/review/commands/sync-reviews.command';
import { ListReviewsQuery } from '../../../application/review/queries/list-reviews.query';
import { GetReviewQuery } from '../../../application/review/queries/get-reviews.query';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { ReviewPrismaRepository } from '../../../infrastructure/database/prisma/repositories/review-prisma.repository';

@Module({
  imports: [DatabaseModule],
  controllers: [ReviewController],
  providers: [
    SyncReviewsCommand,
    ListReviewsQuery,
    GetReviewQuery,
    SteamApiService,
    GamePrismaRepository,
    ReviewPrismaRepository,
  ],
})
export class ReviewModule {}
