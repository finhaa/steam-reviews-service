import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

export interface ReviewJobStatus {
  status: string;
  progress: number;
  result?: { message: string };
  error?: string;
}

@Injectable()
export class ReviewQueueService {
  private readonly logger = new Logger(ReviewQueueService.name);

  constructor(@InjectQueue('reviews') private readonly queue: Queue) {}

  async queueSync(gameId: number): Promise<{ jobId: string; message: string }> {
    this.logger.log(`Queueing review sync for game ${gameId}`);

    const job = await this.queue.add(
      'sync',
      { gameId },
      {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    );

    return {
      jobId: job.id.toString(),
      message: `Review sync job queued successfully with ID ${job.id}`,
    };
  }

  async getJobStatus(jobId: string): Promise<ReviewJobStatus> {
    const job = await this.queue.getJob(jobId);

    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    const progress = Number(job.progress()) || 0;
    const result =
      typeof job.returnvalue === 'object' && job.returnvalue !== null
        ? (job.returnvalue as { message: string })
        : undefined;
    const failedReason =
      typeof job.failedReason === 'string' ? job.failedReason : undefined;

    return {
      status: state,
      progress,
      ...(result && { result }),
      ...(failedReason && { error: failedReason }),
    };
  }
}
