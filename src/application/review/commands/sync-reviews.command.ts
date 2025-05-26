import { Injectable, Logger } from '@nestjs/common';
import { ReviewSyncService } from '../services/review-sync.service';
import { GameValidatorService } from '../../game/services/game-validator.service';
import { ReviewSyncException } from '@domain/review/exceptions/review.exceptions';

@Injectable()
export class SyncReviewsCommand {
  private readonly logger = new Logger(SyncReviewsCommand.name);

  constructor(
    private readonly reviewSyncService: ReviewSyncService,
    private readonly gameValidator: GameValidatorService,
  ) {}

  async execute(gameId: number): Promise<{ message: string }> {
    try {
      this.logger.log(`Starting review sync for game ${gameId}`);

      const game = await this.gameValidator.validateAndGetGame(gameId);
      const processedCount = await this.reviewSyncService.syncGameReviews(
        game.id as number,
        game.appId,
      );

      const message = `Reviews synchronized successfully: processed ${processedCount} reviews.`;
      this.logger.log(message);
      return { message };
    } catch (error) {
      this.logger.error(`Failed to sync reviews for game ${gameId}:`, error);
      throw new ReviewSyncException(
        error instanceof Error ? error.message : 'Unknown error occurred',
        error instanceof Error ? error : undefined,
      );
    }
  }
}
