import { HttpException, HttpStatus } from '@nestjs/common';

export class GameException extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class GameNotFoundException extends GameException {
  constructor(identifier: string | number, cause?: Error) {
    super(`Game not found: ${identifier}`, cause);
  }
}

export class GameDuplicateException extends GameException {
  constructor(identifier: string | number, cause?: Error) {
    super(`Game already exists: ${identifier}`, cause);
  }
}

export class GameOperationException extends GameException {
  constructor(
    public readonly operation: string,
    message: string,
    cause?: Error,
  ) {
    super(`${operation} operation failed: ${message}`, cause);
  }
}

export class GameQueryException extends HttpException {
  constructor(operation: string, message: string, cause?: Error) {
    super(
      {
        message: `Failed to ${operation}: ${message}`,
        error: 'Game Query Error',
        cause: cause?.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
