import { Module } from '@nestjs/common';
import { SyncReviewsCommand } from './commands/sync-reviews.command';
import { ListReviewsQuery } from './queries/list-reviews.query';
import { GetReviewQuery } from './queries/get-review.query';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { ReviewSyncService } from './services/review-sync.service';
import { GameValidatorService } from '@app/game/services/game-validator.service';

@Module({
  imports: [InfrastructureModule],
  providers: [
    SyncReviewsCommand,
    ListReviewsQuery,
    GetReviewQuery,
    ReviewSyncService,
    GameValidatorService,
  ],
  exports: [
    SyncReviewsCommand,
    ListReviewsQuery,
    GetReviewQuery,
    ReviewSyncService,
    GameValidatorService,
  ],
})
export class ReviewModule {}
