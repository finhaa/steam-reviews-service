import { Injectable, ConflictException } from '@nestjs/common';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';
import { Game } from '@domain/game/entities/game.entity';

@Injectable()
export class RegisterGameCommand {
  constructor(private readonly gameRepo: GamePrismaRepository) {}

  async execute(appId: number, name?: string): Promise<Game> {
    const exists = await this.gameRepo.findByAppId(appId);
    if (exists) {
      throw new ConflictException(
        'Game with this appId is already registered.',
      );
    }

    const game = await this.gameRepo.create(
      new Game(undefined, appId, name || null, new Date(), new Date()),
    );
    return game;
  }
}
