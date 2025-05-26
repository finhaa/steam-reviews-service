import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export abstract class BaseExceptionFilter implements ExceptionFilter {
  protected readonly logger: Logger;

  constructor(protected readonly context: string) {
    this.logger = new Logger(context);
  }

  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.getStatus(exception);
    const message = this.getMessage(exception);
    const timestamp = new Date().toISOString();
    const path = request.url;
    const operation = this.getOperationName();

    this.logger.error(
      `${operation} operation failed: ${message}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      timestamp,
      path,
      operation,
    });
  }

  protected abstract getStatus(exception: Error): number;
  protected abstract getMessage(exception: Error): string;
  protected abstract getOperationName(): string;
}
