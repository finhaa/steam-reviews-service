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

@ApiTags('game-reviews')
@Controller('games/:gameId/reviews')
export class GameReviewController {
  private readonly logger = new Logger(GameReviewController.name);

  constructor(
    private readonly syncReviewsCommand: SyncReviewsCommand,
    private readonly listReviewsQuery: ListReviewsQuery,
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
  @ApiOperation({ summary: 'Sync reviews from Steam for a game' })
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
  async syncReviews(
    @Param('gameId', ParseIntPipe) gameId: number,
  ): Promise<{ message: string }> {
    this.logger.log(`Received request to sync reviews for game ${gameId}`);
    return this.syncReviewsCommand.execute(gameId);
  }
}
