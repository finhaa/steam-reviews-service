import { HttpException, HttpStatus } from '@nestjs/common';

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

export class ReviewBatchOperationException extends HttpException {
  constructor(operation: string, message: string, cause?: Error) {
    super(
      {
        message: `Failed to ${operation} reviews: ${message}`,
        error: 'Review Batch Operation Error',
        cause: cause?.message,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
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
