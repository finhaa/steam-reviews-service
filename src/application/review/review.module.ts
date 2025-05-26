import { Module } from '@nestjs/common';
import { SyncReviewsCommand } from './commands/sync-reviews.command';
import { ListReviewsQuery } from './queries/list-reviews.query';
import { GetReviewQuery } from './queries/get-review.query';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [SyncReviewsCommand, ListReviewsQuery, GetReviewQuery],
  exports: [SyncReviewsCommand, ListReviewsQuery, GetReviewQuery],
})
export class ReviewModule {}
