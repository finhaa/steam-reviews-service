import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import axios from 'axios';
import { RetryService } from '@infrastructure/services/retry.service';
import { GameNotFoundException } from '@domain/game/exceptions/game.exceptions';
import {
  SteamAppDetails,
  SteamAppDetailsResponse,
} from './interfaces/steam-app.interface';
import {
  SteamReview,
  SteamReviewsResponse,
} from './interfaces/steam-review.interface';
import { SteamSearchResult } from './interfaces/steam-search.interface';

@Injectable()
export class SteamApiService {
  private readonly logger = new Logger(SteamApiService.name);
  private readonly baseUrl = 'https://store.steampowered.com';
  private readonly pageSize: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly retryService: RetryService,
  ) {
    this.pageSize = this.configService.get('performance.steam.pageSize') ?? 100;
  }

  @Throttle({
    default: {
      ttl: 60000,
      limit: 100,
    },
  })
  async getGameDetails(appId: number): Promise<SteamAppDetails> {
    try {
      const response = await this.retryService.withRetry(() =>
        axios.get<SteamAppDetailsResponse>(`${this.baseUrl}/api/appdetails`, {
          params: { appids: appId },
          headers: { 'User-Agent': 'NestJS-SteamReviewService' },
        }),
      );

      if (!response.data || !response.data[appId]) {
        this.logger.warn(`No data found for app ID ${appId}`);
        throw new GameNotFoundException(
          `Game with Steam App ID ${appId} not found`,
        );
      }

      const appData = response.data[appId];
      if (!appData.success) {
        this.logger.warn(
          `Steam API returned unsuccessful status for app ID ${appId}`,
        );
        throw new GameNotFoundException(
          `Game with Steam App ID ${appId} not found`,
        );
      }

      if (appData.data.type !== 'game') {
        throw new GameNotFoundException(`App ID ${appId} is not a game`);
      }

      return appData.data;
    } catch (error) {
      this.logger.error(
        `Error fetching game details for ${appId}:`,
        error instanceof Error ? error.stack : error,
      );
      if (error instanceof GameNotFoundException) {
        throw error;
      }
      throw new HttpException(
        `Failed to fetch game details: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  @Throttle({
    default: {
      ttl: 60000,
      limit: 100,
    },
  })
  async searchGames(
    query: string,
  ): Promise<Array<{ appid: number; name: string }>> {
    try {
      const response = await this.retryService.withRetry(() =>
        axios.get<SteamSearchResult>(`${this.baseUrl}/api/storesearch`, {
          params: {
            term: query,
            cc: 'us',
            l: 'en',
          },
          headers: { 'User-Agent': 'NestJS-SteamReviewService' },
        }),
      );

      const data = response.data;
      this.logger.debug(`Steam API response for query "${query}":`, data);

      return data.items
        .filter((item) => item.type === 'app')
        .map((item) => ({
          appid: item.id,
          name: item.name,
        }))
        .slice(0, 10);
    } catch (error) {
      this.logger.error(
        `Error searching games:`,
        error instanceof Error ? error.stack : error,
      );
      throw new GameNotFoundException(
        `Failed to search games: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  @Throttle({
    default: {
      ttl: 60000,
      limit: 100,
    },
  })
  async fetchReviewPage(
    appId: number,
    cursor: string = '*',
  ): Promise<{ reviews: SteamReview[]; nextCursor: string | null }> {
    this.logger.debug(
      `Fetching reviews for app ${appId} with cursor ${cursor}`,
    );

    const response = await this.retryService.withRetry(() =>
      axios.get<SteamReviewsResponse>(`${this.baseUrl}/appreviews/${appId}`, {
        params: {
          json: 1,
          filter: 'recent',
          language: 'all',
          cursor: cursor,
          num_per_page: this.pageSize,
        },
        headers: { 'User-Agent': 'NestJS-SteamReviewService' },
      }),
    );

    const data = response.data;
    this.logger.debug(`Received ${data.reviews?.length || 0} reviews`);

    if (data.success !== 1) {
      throw new Error('Steam API returned an unsuccessful status');
    }

    return {
      reviews: data.reviews || [],
      nextCursor: data.cursor && data.cursor !== '' ? data.cursor : null,
    };
  }

  @Throttle({
    default: {
      ttl: 60000,
      limit: 100,
    },
  })
  async fetchAllReviews(appId: number): Promise<SteamReview[]> {
    const allReviews: SteamReview[] = [];
    let cursor = '*';

    try {
      while (cursor) {
        const { reviews, nextCursor } = await this.fetchReviewPage(
          appId,
          cursor,
        );

        if (reviews.length === 0) {
          break;
        }

        allReviews.push(...reviews);

        if (!nextCursor) {
          break;
        }

        cursor = nextCursor;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new HttpException(
        `Failed to fetch reviews: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    return allReviews;
  }
}
