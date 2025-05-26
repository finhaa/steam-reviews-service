import { Module } from '@nestjs/common';
import { GameController } from './game/game.controller';
import { GameReviewController } from './game/game-review.controller';
import { GameModule } from '@app/game/game.module';
import { ReviewModule } from '@app/review/review.module';
import { QueueModule } from '@infrastructure/queue/queue.module';
import { ReviewController } from './review/review.controller';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [GameModule, ReviewModule, QueueModule, InfrastructureModule],
  controllers: [GameController, GameReviewController, ReviewController],
})
export class RestModule {}
