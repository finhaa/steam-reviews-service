import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ReviewQueueService } from './review/review-queue.service';
import { ReviewSyncProcessor } from './review/review-sync.processor';
import { ReviewModule } from '@app/review/review.module';

@Module({
  imports: [
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('redis.host', 'localhost'),
          port: configService.get('redis.port', 6379),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'reviews',
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    }),
    ReviewModule,
  ],
  providers: [ReviewQueueService, ReviewSyncProcessor],
  exports: [ReviewQueueService],
})
export class QueueModule {}
