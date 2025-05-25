import { Game } from '@domain/game/entities/game.entity';
import { GameResponseDto } from '../dto/game.dto';

export class GameDtoMapper {
  static toDto(game: Game): GameResponseDto {
    const dto = new GameResponseDto();
    dto.id = game.id as number;
    dto.appId = game.appId;
    dto.name = game.name || undefined;
    dto.createdAt = game.createdAt;
    dto.updatedAt = game.updatedAt;
    return dto;
  }

  static toDtoList(games: Game[]): GameResponseDto[] {
    return games.map((game) => this.toDto(game));
  }
} 