import { Module } from '@nestjs/common';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { ReviewController } from './review.controller';
import { GetReviewQuery } from '@app/review/queries/get-review.query';

@Module({
  imports: [InfrastructureModule],
  controllers: [ReviewController],
  providers: [GetReviewQuery],
})
export class ReviewModule {}
