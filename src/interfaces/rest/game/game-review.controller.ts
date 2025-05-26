import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { SyncReviewsCommand } from '@app/review/commands/sync-reviews.command';
import { ListReviewsQuery } from '@app/review/queries/list-reviews.query';
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
  @ApiOperation({ summary: 'List reviews for a game' })
  @ApiParam({ name: 'gameId', type: Number })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (1-based)',
    example: 1,
  })
  @ApiQuery({
    name: 'pageSize',
    type: Number,
    required: false,
    description: 'Number of items per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Reviews retrieved successfully',
    schema: {
      properties: {
        reviews: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/ReviewResponseDto',
          },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        pageSize: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
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
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
  ) {
    this.logger.log(
      `Received request to list reviews for game ${gameId} (page ${page}, size ${pageSize})`,
    );

    const result = await this.listReviewsQuery.execute(gameId, page, pageSize);
    return {
      ...result,
      reviews: ReviewDtoMapper.toDtoList(result.reviews),
    };
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
