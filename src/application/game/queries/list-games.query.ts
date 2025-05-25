import { Injectable } from '@nestjs/common';
import { GamePrismaRepository } from '../../../infrastructure/database/prisma/repositories/game-prisma.repository';
import { Game } from '../../../domain/game/entities/game.entity';

@Injectable()
export class ListGamesQuery {
  constructor(private readonly gameRepo: GamePrismaRepository) {}

  async execute(): Promise<Game[]> {
    return this.gameRepo.findAll();
  }
}
