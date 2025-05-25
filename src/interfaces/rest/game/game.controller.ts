import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterGameCommand } from '@app/game/commands/register-game.command';
import { ListGamesQuery } from '@app/game/queries/list-games.query';
import {
  GameResponseDto,
  RegisterGameDto,
} from '@app/game/dto/game.dto';
import { Game } from '@domain/game/entities/game.entity';

@ApiTags('Games')
@Controller('games')
export class GameController {
  constructor(
    private readonly registerGameCommand: RegisterGameCommand,
    private readonly listGamesQuery: ListGamesQuery,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new game by Steam AppID' })
  @ApiResponse({
    status: 201,
    description: 'Game registered successfully.',
    type: GameResponseDto,
  })
  async registerGame(@Body() dto: RegisterGameDto): Promise<Game> {
    return this.registerGameCommand.execute(dto.appId, dto.name);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered games' })
  @ApiResponse({
    status: 200,
    description: 'List of games',
    type: [GameResponseDto],
  })
  async listGames(): Promise<Game[]> {
    return this.listGamesQuery.execute();
  }
}
