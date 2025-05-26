import { Catch, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception.filter';
import {
  InvalidReviewDataException,
  ReviewNotFoundException,
  ReviewSyncException,
} from '@domain/review/exceptions/review.exceptions';

@Catch(InvalidReviewDataException, ReviewNotFoundException, ReviewSyncException)
export class ReviewExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(ReviewExceptionFilter.name);
  }

  protected getStatus(exception: Error): number {
    if (exception instanceof ReviewNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof InvalidReviewDataException) {
      return HttpStatus.BAD_REQUEST;
    }
    if (exception instanceof ReviewSyncException) {
      return HttpStatus.BAD_GATEWAY;
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  protected getMessage(exception: Error): string {
    return (
      exception.message ||
      'An error occurred while processing the review operation'
    );
  }

  protected getOperationName(): string {
    return 'Review';
  }
}
