import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { GameRepository } from '@domain/game/repositories/game.repository';
import { Game } from '@domain/game/entities/game.entity';
import { GameMapper } from '@infrastructure/database/prisma/mappers/game.mapper';
import {
  GameDuplicateException,
  GameNotFoundException,
  GameOperationException,
} from '@domain/game/exceptions/game.exceptions';

@Injectable()
export class GamePrismaRepository implements GameRepository {
  private readonly logger = new Logger(GamePrismaRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(game: Game): Promise<Game> {
    try {
      const existingGame = await this.findByAppId(game.appId);
      if (existingGame) {
        throw new GameDuplicateException(game.appId);
      }

      const created = await this.prisma.game.create({
        data: GameMapper.toPrisma(game),
      });

      return GameMapper.toDomain(created);
    } catch (error) {
      this.logger.error(
        `Failed to create game with appId ${game.appId}:`,
        error,
      );

      if (error instanceof GameDuplicateException) {
        throw error;
      }

      throw new GameOperationException(
        'create',
        `Failed to create game with appId ${game.appId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findById(id: number): Promise<Game | null> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { id },
      });

      return game ? GameMapper.toDomain(game) : null;
    } catch (error) {
      this.logger.error(`Failed to find game by ID ${id}:`, error);
      throw new GameOperationException(
        'find',
        `Failed to find game by ID ${id}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findByAppId(appId: number): Promise<Game | null> {
    try {
      const game = await this.prisma.game.findUnique({
        where: { appId },
      });

      return game ? GameMapper.toDomain(game) : null;
    } catch (error) {
      this.logger.error(`Failed to find game by Steam App ID ${appId}:`, error);
      throw new GameOperationException(
        'find',
        `Failed to find game by Steam App ID ${appId}`,
        error instanceof Error ? error : undefined,
      );
    }
  }

  async findAll(): Promise<Game[]> {
    try {
      const games = await this.prisma.game.findMany();
      return games.map((game) => GameMapper.toDomain(game));
    } catch (error) {
      this.logger.error('Failed to find all games:', error);
      throw new GameOperationException(
        'find',
        'Failed to find all games',
        error instanceof Error ? error : undefined,
      );
    }
  }

  async update(game: Game): Promise<Game> {
    try {
      if (!game.id) {
        throw new GameNotFoundException('Cannot update game without ID');
      }

      const updated = await this.prisma.game.update({
        where: { id: game.id },
        data: GameMapper.toPrisma(game),
      });

      return GameMapper.toDomain(updated);
    } catch (error) {
      this.logger.error(`Failed to update game ${game.id}:`, error);

      if (error instanceof GameNotFoundException) {
        throw error;
      }

      throw new GameOperationException(
        'update',
        `Failed to update game ${game.id}`,
        error instanceof Error ? error : undefined,
      );
    }
  }
}
