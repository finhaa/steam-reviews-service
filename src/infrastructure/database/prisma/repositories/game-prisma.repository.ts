import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { GameRepository } from '@domain/game/repositories/game.repository';
import { Game } from '@domain/game/entities/game.entity';
import { GameMapper } from '@infrastructure/database/prisma/mappers/game.mapper';

@Injectable()
export class GamePrismaRepository implements GameRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({ where: { id } });
    return game ? GameMapper.toDomain(game) : null;
  }

  async findByAppId(appId: number): Promise<Game | null> {
    const game = await this.prisma.game.findUnique({ where: { appId } });
    return game ? GameMapper.toDomain(game) : null;
  }

  async findAll(): Promise<Game[]> {
    const games = await this.prisma.game.findMany();
    return games.map((game) => GameMapper.toDomain(game));
  }

  async create(game: Game): Promise<Game> {
    const created = await this.prisma.game.create({
      data: {
        appId: game.appId,
        name: game.name,
      },
    });
    return GameMapper.toDomain(created);
  }
}
