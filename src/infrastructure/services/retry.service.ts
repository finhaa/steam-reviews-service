import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class RetryableError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error,
  ) {
    super(message);
    this.name = 'RetryableError';
  }
}

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name);
  private readonly initialDelay: number;
  private readonly maxDelay: number;
  private readonly maxAttempts: number;

  constructor(private readonly configService: ConfigService) {
    this.initialDelay = this.validateConfig(
      'performance.steam.backoff.initialDelay',
      1000,
    );
    this.maxDelay = this.validateConfig(
      'performance.steam.backoff.maxDelay',
      30000,
    );
    this.maxAttempts = this.validateConfig(
      'performance.steam.backoff.maxAttempts',
      3,
    );

    if (this.maxDelay < this.initialDelay) {
      throw new Error('maxDelay must be greater than or equal to initialDelay');
    }
  }

  private validateConfig(key: string, defaultValue: number): number {
    const value = this.configService.get<number>(key, defaultValue);
    if (typeof value !== 'number' || value <= 0) {
      this.logger.warn(
        `Invalid configuration value for ${key}. Using default: ${defaultValue}`,
      );
      return defaultValue;
    }
    return value;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private calculateDelay(attempt: number): number {
    return Math.min(
      this.initialDelay * Math.pow(2, attempt - 1),
      this.maxDelay,
    );
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof RetryableError) {
      return true;
    }

    // Add specific error types that should be retried
    if (error instanceof Error) {
      // Retry network-related errors
      if (
        error.message.includes('ECONNRESET') ||
        error.message.includes('ETIMEDOUT') ||
        error.message.includes('ECONNREFUSED')
      ) {
        return true;
      }

      // Retry rate limit errors
      if (error.message.includes('429')) {
        return true;
      }
    }

    return false;
  }

  async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 1;
    let lastError: Error | null = null;

    while (attempt <= this.maxAttempts) {
      try {
        return await operation();
      } catch (error) {
        const isRetryable = this.isRetryableError(error);
        lastError = error instanceof Error ? error : new Error(String(error));

        if (!isRetryable || attempt === this.maxAttempts) {
          this.logger.error(
            `Operation failed after ${attempt} attempts: ${lastError.message}`,
            lastError.stack,
          );
          throw new RetryableError(
            `Operation failed after ${attempt} attempts: ${lastError.message}`,
            lastError,
          );
        }

        const delayMs = this.calculateDelay(attempt);
        this.logger.warn(
          `Attempt ${attempt} failed. Retrying in ${delayMs}ms: ${lastError.message}`,
        );

        await this.delay(delayMs);
        attempt++;
      }
    }

    // This should never happen due to the while loop condition
    throw new Error('Unexpected retry failure');
  }
}
