import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameReviewController } from './game-review.controller';
import { RegisterGameCommand } from '@app/game/commands/register-game.command';
import { ListGamesQuery } from '@app/game/queries/list-games.query';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';
import { SyncReviewsCommand } from '@app/review/commands/sync-reviews.command';
import { ListReviewsQuery } from '@app/review/queries/list-reviews.query';

@Module({
  imports: [InfrastructureModule],
  controllers: [GameController, GameReviewController],
  providers: [
    RegisterGameCommand,
    ListGamesQuery,
    SyncReviewsCommand,
    ListReviewsQuery,
  ],
})
export class GameModule {}
