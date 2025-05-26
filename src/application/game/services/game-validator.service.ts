import { Injectable, NotFoundException } from '@nestjs/common';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';
import { Game } from '@domain/game/entities/game.entity';
import { InvalidReviewDataException } from '@domain/review/exceptions/review.exceptions';

@Injectable()
export class GameValidatorService {
  constructor(private readonly gameRepo: GamePrismaRepository) {}

  async validateAndGetGame(gameId: number): Promise<Game> {
    if (!gameId || isNaN(gameId)) {
      throw new InvalidReviewDataException('Invalid game ID provided');
    }

    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      throw new NotFoundException(`Game with ID ${gameId} not found`);
    }
    if (!(game instanceof Game) || typeof game.appId !== 'number') {
      throw new InvalidReviewDataException(
        'Invalid game data retrieved from database',
      );
    }

    return game;
  }
}
