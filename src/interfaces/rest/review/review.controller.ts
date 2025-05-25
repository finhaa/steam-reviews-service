import {
  Controller,
  Get,
  HttpStatus,
  Logger,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetReviewQuery } from '@app/review/queries/get-review.query';
import { ReviewResponseDto } from '@app/review/dto/review.dto';
import { ReviewDtoMapper } from '@app/review/mappers/review-dto.mapper';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewController {
  private readonly logger = new Logger(ReviewController.name);

  constructor(private readonly getReviewQuery: GetReviewQuery) {}

  @Get(':reviewId')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'reviewId', type: Number })
  @ApiQuery({ name: 'gameId', type: Number, required: false })
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
    description: 'Invalid review ID',
  })
  async getReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Query('gameId', new ParseIntPipe({ optional: true })) gameId?: number,
  ): Promise<ReviewResponseDto> {
    this.logger.log(
      `Received request to get review ${reviewId}${
        gameId ? ` for game ${gameId}` : ''
      }`,
    );

    const review = await this.getReviewQuery.execute(reviewId, gameId);
    const responseDto = ReviewDtoMapper.toDto(review);

    this.logger.log(`Returning review ${reviewId}`);

    return responseDto;
  }
}
