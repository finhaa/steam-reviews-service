import { Injectable, Logger } from '@nestjs/common';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';
import { Game } from '@domain/game/entities/game.entity';
import { GameOperationException } from '@domain/game/exceptions/game.exceptions';
import { SteamApiService } from '@infrastructure/external/steam-api/steam-api.service';

@Injectable()
export class RegisterGameCommand {
  private readonly logger = new Logger(RegisterGameCommand.name);

  constructor(
    private readonly gameRepo: GamePrismaRepository,
    private readonly steamService: SteamApiService,
  ) {}

  async execute(appId: number): Promise<Game> {
    try {
      this.logger.log(`Registering game with Steam App ID ${appId}`);

      const gameDetails = await this.steamService.getGameDetails(appId);
      const game = Game.fromSteamDetails(appId, gameDetails);

      const savedGame = await this.gameRepo.create(game);

      this.logger.log(
        `Successfully registered game ${savedGame.name} (ID: ${savedGame.id})`,
      );
      return savedGame;
    } catch (error) {
      this.logger.error(`Failed to register game with App ID ${appId}:`, error);
      throw new GameOperationException(
        'register',
        `Failed to register game: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
