import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { SyncReviewsCommand } from '../../../application/review/commands/sync-reviews.command';
import { ListReviewsQuery } from '../../../application/review/queries/list-reviews.query';
import { GetReviewQuery } from '../../../application/review/queries/get-reviews.query';
import { InfrastructureModule } from '../../../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [ReviewController],
  providers: [SyncReviewsCommand, ListReviewsQuery, GetReviewQuery],
})
export class ReviewModule {}
