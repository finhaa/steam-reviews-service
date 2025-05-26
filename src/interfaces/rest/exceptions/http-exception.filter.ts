import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from './base-exception.filter';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor() {
    super(HttpExceptionFilter.name);
  }

  protected getStatus(exception: Error): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  protected getMessage(exception: Error): string {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? response
        : (response as { message: string }).message || exception.message;
    }
    return exception.message || 'Internal server error';
  }

  protected getOperationName(): string {
    return 'HTTP';
  }
}
