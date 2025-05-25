import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { RegisterGameCommand } from '@app/game/commands/register-game.command';
import { ListGamesQuery } from '@app/game/queries/list-games.query';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  controllers: [GameController],
  providers: [RegisterGameCommand, ListGamesQuery],
})
export class GameModule {}
