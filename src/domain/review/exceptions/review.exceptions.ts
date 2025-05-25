import { HttpException, HttpStatus } from '@nestjs/common';

export class ReviewException extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ReviewNotFoundException extends ReviewException {
  constructor(identifier: string | number, cause?: Error) {
    super(`Review not found: ${identifier}`, cause);
  }
}

export class ReviewOperationException extends ReviewException {
  constructor(
    public readonly operation: string,
    message: string,
    cause?: Error,
  ) {
    super(`${operation} operation failed: ${message}`, cause);
  }
}

export class ReviewBatchOperationException extends ReviewException {
  constructor(
    public readonly operation: string,
    message: string,
    cause?: Error,
  ) {
    super(`Batch ${operation} operation failed: ${message}`, cause);
  }
}

export class ReviewDuplicateException extends ReviewException {
  constructor(identifier: string, cause?: Error) {
    super(`Review already exists: ${identifier}`, cause);
  }
}

export class InvalidReviewDataException extends HttpException {
  constructor(message: string) {
    super(
      {
        message: `Invalid review data: ${message}`,
        error: 'Invalid Review Data',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class ReviewQueryException extends HttpException {
  constructor(operation: string, message: string, cause?: Error) {
    super(
      {
        message: `Failed to ${operation}: ${message}`,
        error: 'Review Query Error',
        cause: cause?.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}

export class ReviewSyncException extends HttpException {
  constructor(message: string, cause?: Error) {
    super(
      {
        message: `Failed to sync reviews: ${message}`,
        error: 'Review Sync Error',
        cause: cause?.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
