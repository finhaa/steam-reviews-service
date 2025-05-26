import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { RegisterGameCommand } from '@app/game/commands/register-game.command';
import { ListGamesQuery } from '@app/game/queries/list-games.query';
import { GameResponseDto, RegisterGameDto } from '@app/game/dto/game.dto';
import { GameDtoMapper } from '@app/game/mappers/game-dto.mapper';
import { SteamApiService } from '@infrastructure/external/steam-api/steam-api.service';

@ApiTags('Games')
@Controller('games')
export class GameController {
  private readonly logger = new Logger(GameController.name);

  constructor(
    private readonly registerGameCommand: RegisterGameCommand,
    private readonly listGamesQuery: ListGamesQuery,
    private readonly steamService: SteamApiService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Register a new game' })
  @ApiResponse({
    status: 201,
    description: 'Game registered successfully',
    type: GameResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid game data',
  })
  async registerGame(@Body() dto: RegisterGameDto): Promise<GameResponseDto> {
    this.logger.log(
      `Received request to register game with app ID ${dto.appId}`,
    );

    const game = await this.registerGameCommand.execute(dto.appId);
    const responseDto = GameDtoMapper.toDto(game);

    this.logger.log(
      `Successfully registered game ${game.name} (ID: ${game.id})`,
    );

    return responseDto;
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

  @Get('search')
  @ApiOperation({ summary: 'Search games on Steam' })
  @ApiQuery({
    name: 'query',
    required: true,
    type: String,
    description: 'Search term for games',
  })
  @ApiResponse({
    status: 200,
    description: 'List of matching games',
    type: [GameResponseDto],
  })
  async searchGames(
    @Query('query') query: string,
  ): Promise<Array<{ appid: number; name: string }>> {
    return this.steamService.searchGames(query);
  }
}
