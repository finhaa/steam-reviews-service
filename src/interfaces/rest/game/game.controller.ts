import { Body, Controller, Get, Logger, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegisterGameCommand } from '@app/game/commands/register-game.command';
import { ListGamesQuery } from '@app/game/queries/list-games.query';
import { GameResponseDto, RegisterGameDto } from '@app/game/dto/game.dto';
import { GameDtoMapper } from '@app/game/mappers/game-dto.mapper';

@ApiTags('Games')
@Controller('games')
export class GameController {
  private readonly logger = new Logger(GameController.name);

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
  async registerGame(@Body() dto: RegisterGameDto): Promise<GameResponseDto> {
    this.logger.log(
      `Received request to register game with appId ${dto.appId}`,
    );
    const game = await this.registerGameCommand.execute(dto.appId, dto.name);
    this.logger.log(`Game registered successfully with ID ${game.id}`);
    return GameDtoMapper.toDto(game);
  }

  @Get()
  @ApiOperation({ summary: 'List all registered games' })
  @ApiResponse({
    status: 200,
    description: 'List of games',
    type: [GameResponseDto],
  })
  async listGames(): Promise<GameResponseDto[]> {
    this.logger.log('Received request to list all games');
    const games = await this.listGamesQuery.execute();
    this.logger.log(`Returning ${games.length} games`);
    return GameDtoMapper.toDtoList(games);
  }
}
