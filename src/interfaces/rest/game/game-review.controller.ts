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
import { ReviewResponseDto } from '@app/review/dto/review.dto';
import { ReviewDtoMapper } from '@app/review/mappers/review-dto.mapper';
import { ReviewQueueService } from '@infrastructure/queue/review/review-queue.service';

@ApiTags('game-reviews')
@Controller('games/:gameId/reviews')
export class GameReviewController {
  private readonly logger = new Logger(GameReviewController.name);

  constructor(
    private readonly syncReviewsCommand: SyncReviewsCommand,
    private readonly listReviewsQuery: ListReviewsQuery,
    private readonly reviewQueue: ReviewQueueService,
  ) {}

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

  @Post('sync')
  @ApiOperation({ summary: 'Queue a review sync job from Steam for a game' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiResponse({
    status: 202,
    description: 'Review sync job queued successfully',
    schema: {
      properties: {
        jobId: { type: 'string' },
        message: { type: 'string' },
      },
    },
  })
  async syncReviews(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<{ jobId: string; message: string }> {
    this.logger.log(`Received request to sync reviews for game ${gameId}`);
    return await this.reviewQueue.queueSync(gameId);
  }

  @Get('sync/:jobId/status')
  @ApiOperation({ summary: 'Get the status of a review sync job' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiParam({ name: 'jobId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    schema: {
      properties: {
        status: { type: 'string' },
        progress: { type: 'number' },
        result: { type: 'object', nullable: true },
        error: { type: 'string', nullable: true },
      },
    },
  })
  async getJobStatus(@Param('jobId') jobId: string) {
    return await this.reviewQueue.getJobStatus(jobId);
  }
}
