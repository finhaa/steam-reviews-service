import { Injectable, Logger } from '@nestjs/common';
import { Game } from '@domain/game/entities/game.entity';
import {
  GameDuplicateException,
  GameNotFoundException,
  GameOperationException,
} from '@domain/game/exceptions/game.exceptions';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';
import { SteamApiService } from '@infrastructure/external/steam-api.service';

@Injectable()
export class RegisterGameCommand {
  private readonly logger = new Logger(RegisterGameCommand.name);

  constructor(
    private readonly gameRepo: GamePrismaRepository,
    private readonly steamService: SteamApiService,
  ) {}

  async execute(appId: number, name?: string): Promise<Game> {
    try {
      this.logger.log(`Registering game: ${name || 'Unknown'} (${appId})`);

      const existingGame = await this.gameRepo.findByAppId(appId);
      if (existingGame) {
        throw new GameDuplicateException(appId);
      }

      const existsOnSteam = await this.steamService.validateGameExists(appId);
      if (!existsOnSteam) {
        throw new GameNotFoundException(
          `Game with Steam App ID ${appId} does not exist on Steam`,
        );
      }

      const game = new Game(
        undefined,
        appId,
        name || null,
        new Date(),
        new Date(),
      );
      return this.gameRepo.create(game);
    } catch (error) {
      this.logger.error(
        `Failed to register game ${appId}:`,
        error instanceof Error ? error.stack : error,
      );

      if (
        error instanceof GameDuplicateException ||
        error instanceof GameNotFoundException
      ) {
        throw error;
      }

      throw new GameOperationException(
        'register',
        `Failed to register game with appId ${appId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
