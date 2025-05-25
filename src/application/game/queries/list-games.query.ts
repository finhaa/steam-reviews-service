import { Injectable, Logger } from '@nestjs/common';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';
import { Game } from '@domain/game/entities/game.entity';
import { GameQueryException } from '@domain/game/exceptions/game.exceptions';

@Injectable()
export class ListGamesQuery {
  private readonly logger = new Logger(ListGamesQuery.name);

  constructor(private readonly gameRepo: GamePrismaRepository) {}

  async execute(): Promise<Game[]> {
    try {
      this.logger.log('Fetching all games');
      const games = await this.gameRepo.findAll();
      this.logger.log(`Found ${games.length} games`);
      return games;
    } catch (error) {
      this.logger.error('Failed to fetch games:', error);
      throw new GameQueryException(
        'list games',
        'Failed to fetch games',
        error instanceof Error ? error : undefined,
      );
    }
  }
}
