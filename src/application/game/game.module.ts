import { Module } from '@nestjs/common';
import { RegisterGameCommand } from './commands/register-game.command';
import { ListGamesQuery } from './queries/list-games.query';
import { InfrastructureModule } from '@infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [RegisterGameCommand, ListGamesQuery],
  exports: [RegisterGameCommand, ListGamesQuery],
})
export class GameModule {}
