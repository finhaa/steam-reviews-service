import { Game as PrismaGame, Prisma } from '@prisma/client';
import {
  Game,
  GameCategory,
  GameGenre,
  GamePlatforms,
} from '@domain/game/entities/game.entity';

export class GameMapper {
  static toDomain(prismaGame: PrismaGame): Game {
    return new Game(
      prismaGame.id,
      prismaGame.appId,
      prismaGame.name,
      prismaGame.description,
      prismaGame.shortDescription,
      prismaGame.headerImage,
      prismaGame.website,
      prismaGame.developers,
      prismaGame.publishers,
      prismaGame.isFree,
      prismaGame.requiredAge,
      prismaGame.metacriticScore,
      prismaGame.metacriticUrl,
      prismaGame.releaseDate,
      prismaGame.platforms as GamePlatforms,
      prismaGame.categories as GameCategory[],
      prismaGame.genres as GameGenre[],
      prismaGame.createdAt,
      prismaGame.updatedAt,
    );
  }

  static toPrisma(game: Game): Prisma.GameCreateInput {
    return {
      appId: game.appId,
      name: game.name,
      description: game.description,
      shortDescription: game.shortDescription,
      headerImage: game.headerImage,
      website: game.website,
      developers: game.developers,
      publishers: game.publishers,
      isFree: game.isFree,
      requiredAge: game.requiredAge,
      metacriticScore: game.metacriticScore,
      metacriticUrl: game.metacriticUrl,
      releaseDate: game.releaseDate,
      platforms: game.platforms as unknown as Prisma.InputJsonValue,
      categories: game.categories as unknown as Prisma.InputJsonValue,
      genres: game.genres as unknown as Prisma.InputJsonValue,
    };
  }
}
