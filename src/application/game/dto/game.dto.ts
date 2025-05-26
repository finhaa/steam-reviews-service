import {
  GameCategory,
  GameGenre,
  GamePlatforms,
} from '@domain/game/entities/game.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterGameDto {
  @ApiProperty({ example: 570 })
  @IsInt()
  appId: number;

  @ApiProperty({ example: 'Dota 2', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

export class GameResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the game',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'The Steam App ID of the game',
    example: 570,
  })
  appId: number;

  @ApiProperty({
    description: 'The name of the game',
    example: 'Dota 2',
  })
  name: string;

  @ApiProperty({
    description: 'The detailed description of the game',
    example: 'A detailed description of the game...',
  })
  description: string;

  @ApiProperty({
    description: 'A short description of the game',
    example: 'A brief overview of the game...',
  })
  shortDescription: string;

  @ApiProperty({
    description: 'URL to the game header image',
    example: 'https://cdn.cloudflare.steamstatic.com/steam/apps/570/header.jpg',
  })
  headerImage: string;

  @ApiProperty({
    description: 'The official website of the game',
    example: 'https://www.dota2.com/',
    required: false,
  })
  website: string | null;

  @ApiProperty({
    description: 'List of game developers',
    example: ['Valve'],
    isArray: true,
  })
  developers: string[];

  @ApiProperty({
    description: 'List of game publishers',
    example: ['Valve'],
    isArray: true,
  })
  publishers: string[];

  @ApiProperty({
    description: 'Whether the game is free to play',
    example: true,
  })
  isFree: boolean;

  @ApiProperty({
    description: 'Required age to play the game',
    example: 0,
  })
  requiredAge: number;

  @ApiProperty({
    description: 'Metacritic score of the game',
    example: 90,
    required: false,
  })
  metacriticScore: number | null;

  @ApiProperty({
    description: 'URL to the Metacritic page',
    example: 'https://www.metacritic.com/game/pc/dota-2',
    required: false,
  })
  metacriticUrl: string | null;

  @ApiProperty({
    description: 'Release date of the game',
    example: '2013-07-09T00:00:00Z',
    required: false,
  })
  releaseDate: Date | null;

  @ApiProperty({
    description: 'Supported platforms',
    example: {
      windows: true,
      mac: true,
      linux: true,
    },
  })
  platforms: GamePlatforms;

  @ApiProperty({
    description: 'Game categories',
    example: [
      { id: 1, description: 'Multi-player' },
      { id: 2, description: 'Free to Play' },
    ],
    isArray: true,
  })
  categories: Array<GameCategory>;

  @ApiProperty({
    description: 'Game genres',
    example: [
      { id: 1, description: 'Action' },
      { id: 2, description: 'Strategy' },
    ],
    isArray: true,
  })
  genres: Array<GameGenre>;

  @ApiProperty({
    description: 'When the game was registered in our system',
    example: '2024-03-20T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the game information was last updated',
    example: '2024-03-20T12:00:00Z',
  })
  updatedAt: Date;
}
