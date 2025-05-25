import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { RegisterGameCommand } from '../../../application/game/commands/register-game.command';
import { ListGamesQuery } from '../../../application/game/queries/list-games.query';
import { DatabaseModule } from 'src/infrastructure/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [GameController],
  providers: [RegisterGameCommand, ListGamesQuery],
})
export class GameModule {}
