import { SyncReviewsCommand } from '@app/review/commands/sync-reviews.command';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('reviews')
export class ReviewSyncProcessor {
  private readonly logger = new Logger(ReviewSyncProcessor.name);

  constructor(private readonly syncReviewsCommand: SyncReviewsCommand) {}

  @Process('sync')
  async handleSync(job: Job<{ gameId: number }>) {
    this.logger.log(
      `Processing review sync job ${job.id} for game ${job.data.gameId}`,
    );

    try {
      const result = await this.syncReviewsCommand.execute(job.data.gameId);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to process review sync job ${job.id}:`,
        error instanceof Error ? error.stack : error,
      );
      throw error;
    }
  }
}
