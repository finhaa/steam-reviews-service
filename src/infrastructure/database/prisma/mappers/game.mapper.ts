import { Game as PrismaGame } from '@prisma/client';
import { Game } from '../../../../domain/game/entities/game.entity';

export class GameMapper {
  static toDomain(prismaGame: PrismaGame): Game {
    return new Game(
      prismaGame.id,
      prismaGame.appId,
      prismaGame.name,
      prismaGame.createdAt,
      prismaGame.updatedAt,
    );
  }

  static toPrisma(game: Game): PrismaGame {
    return {
      id: game.id,
      appId: game.appId,
      name: game.name,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    };
  }
}
