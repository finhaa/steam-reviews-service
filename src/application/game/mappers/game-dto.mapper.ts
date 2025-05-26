import { Game } from '@domain/game/entities/game.entity';
import { GameResponseDto } from '../dto/game.dto';

export class GameDtoMapper {
  static toDto(game: Game): GameResponseDto {
    const dto = new GameResponseDto();
    dto.id = game.id as number;
    dto.appId = game.appId;
    dto.name = game.name;
    dto.description = game.description;
    dto.shortDescription = game.shortDescription;
    dto.headerImage = game.headerImage;
    dto.website = game.website;
    dto.developers = game.developers;
    dto.publishers = game.publishers;
    dto.isFree = game.isFree;
    dto.requiredAge = game.requiredAge;
    dto.metacriticScore = game.metacriticScore;
    dto.metacriticUrl = game.metacriticUrl;
    dto.releaseDate = game.releaseDate;
    dto.platforms = game.platforms;
    dto.categories = game.categories;
    dto.genres = game.genres;
    dto.createdAt = game.createdAt;
    dto.updatedAt = game.updatedAt;
    return dto;
  }

  static toDtoList(games: Game[]): GameResponseDto[] {
    return games.map((game) => this.toDto(game));
  }
}
