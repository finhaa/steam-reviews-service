import { Injectable, Logger } from '@nestjs/common';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';
import { Game } from '@domain/game/entities/game.entity';
import {
  GameOperationException,
  GameDuplicateException,
} from '@domain/game/exceptions/game.exceptions';

@Injectable()
export class RegisterGameCommand {
  private readonly logger = new Logger(RegisterGameCommand.name);

  constructor(private readonly gameRepo: GamePrismaRepository) {}

  async execute(appId: number, name?: string): Promise<Game> {
    try {
      this.logger.log(`Checking if game with appId ${appId} exists`);
      const exists = await this.gameRepo.findByAppId(appId);
      if (exists) {
        this.logger.warn(`Game with appId ${appId} already exists`);
        throw new GameDuplicateException(appId);
      }

      this.logger.log(`Creating new game with appId ${appId}`);
      const game = await this.gameRepo.create(
        new Game(undefined, appId, name || null, new Date(), new Date()),
      );
      this.logger.log(`Game created successfully with ID ${game.id}`);
      return game;
    } catch (error) {
      this.logger.error(`Failed to register game with appId ${appId}:`, error);
      if (error instanceof GameDuplicateException) {
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
