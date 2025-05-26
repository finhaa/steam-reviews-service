import { Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception.filter';
import {
  GameDuplicateException,
  GameNotFoundException,
  GameOperationException,
} from '@domain/game/exceptions/game.exceptions';

@Catch(GameDuplicateException, GameNotFoundException, GameOperationException)
export class GameExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(GameExceptionFilter.name);
  }

  protected getStatus(exception: Error): number {
    if (exception instanceof GameNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof GameDuplicateException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof GameOperationException) {
      return HttpStatus.BAD_REQUEST;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  protected getMessage(exception: Error): string {
    return (
      exception.message ||
      'An error occurred while processing the game operation'
    );
  }

  protected getOperationName(): string {
    return 'Game';
  }
}
