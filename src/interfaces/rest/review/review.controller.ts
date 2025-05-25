import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { SyncReviewsCommand } from '../../../application/review/commands/sync-reviews.command';
import { ListReviewsQuery } from '../../../application/review/queries/list-reviews.query';
import { GetReviewQuery } from '../../../application/review/queries/get-reviews.query';
import { ReviewResponseDto } from '../../../application/review/dto/review.dto';
import { Review } from '../../../domain/review/entities/review.entity';

@ApiTags('Reviews')
@Controller('games/:gameId/reviews')
export class ReviewController {
  constructor(
    private readonly syncReviewsCommand: SyncReviewsCommand,
    private readonly listReviewsQuery: ListReviewsQuery,
    private readonly getReviewQuery: GetReviewQuery,
  ) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Fetch and sync reviews for a game' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reviews fetched and synchronized.',
  })
  async fetchAndSync(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<{ message: string }> {
    return await this.syncReviewsCommand.execute(gameId);
  }

  @Get()
  @ApiOperation({ summary: 'List all reviews for a game' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of reviews',
    type: [ReviewResponseDto],
  })
  async listReviews(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<Review[]> {
    return this.listReviewsQuery.execute(gameId);
  }

  @Get(':reviewId')
  @ApiOperation({ summary: 'Get a single review by ID' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiParam({ name: 'reviewId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'The review',
    type: ReviewResponseDto,
  })
  async getReview(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ): Promise<Review> {
    return this.getReviewQuery.execute(gameId, reviewId);
  }
}
