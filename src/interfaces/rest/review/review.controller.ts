import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SyncReviewsCommand } from '@app/review/commands/sync-reviews.command';
import { ListReviewsQuery } from '@app/review/queries/list-reviews.query';
import { GetReviewQuery } from '@app/review/queries/get-reviews.query';
import { ReviewResponseDto } from '@app/review/dto/review.dto';
import { ReviewDtoMapper } from '@app/review/mappers/review-dto.mapper';

@ApiTags('reviews')
@Controller('games/:gameId/reviews')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(
    private readonly syncReviewsCommand: SyncReviewsCommand,
    private readonly listReviewsQuery: ListReviewsQuery,
    private readonly getReviewQuery: GetReviewQuery,
  ) {}

  @Post('fetch')
  @ApiOperation({ summary: 'Fetch and sync reviews from Steam' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Reviews synchronized successfully',
    schema: {
      properties: {
        message: { type: 'string' },
      },
    },
  })
  async fetchAndSync(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<{ message: string }> {
    this.logger.log(`Received request to sync reviews for game ${gameId}`);
    return this.syncReviewsCommand.execute(gameId);
  }

  @Get()
  @ApiOperation({ summary: 'List all reviews for a game' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of reviews',
    type: [ReviewResponseDto],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Game not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid game ID',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Internal server error while fetching reviews',
  })
  async listReviews(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<ReviewResponseDto[]> {
    this.logger.log(`Received request to list reviews for game ${gameId}`);

    const reviews = await this.listReviewsQuery.execute(gameId);
    const responseDtos = ReviewDtoMapper.toDtoList(reviews);

    this.logger.log(
      `Returning ${responseDtos.length} reviews for game ${gameId}`,
    );

    return responseDtos;
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
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid game ID or review ID',
  })
  async getReview(
    @Param('gameId', ParseIntPipe) gameId: number,
    @Param('reviewId', ParseIntPipe) reviewId: number,
  ): Promise<ReviewResponseDto> {
    this.logger.log(
      `Received request to get review ${reviewId} for game ${gameId}`,
    );

    const review = await this.getReviewQuery.execute(gameId, reviewId);
    const responseDto = ReviewDtoMapper.toDto(review);

    this.logger.log(`Returning review ${reviewId}`);

    return responseDto;
  }
}
