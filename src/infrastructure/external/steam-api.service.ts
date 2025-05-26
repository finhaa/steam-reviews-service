import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import axios from 'axios';
import { RetryService } from '@infrastructure/services/retry.service';
import { GameNotFoundException } from '@domain/game/exceptions/game.exceptions';

export interface SteamReview {
  recommendationid: string;
  author?: { steamid: string };
  review: string;
  timestamp_created: number;
  timestamp_updated: number;
  voted_up: boolean;
}

interface SteamApiResponse {
  success: number;
  reviews: SteamReview[];
  cursor: string;
}

interface SteamAppDetails {
  success: boolean;
  data: {
    type: string;
    name: string;
    steam_appid: number;
    is_free: boolean;
  };
}

interface SteamSearchResult {
  total: number;
  items: Array<{
    type: string;
    name: string;
    id: number;
    tiny_image: string;
    metascore: string;
    platforms: {
      windows: boolean;
      mac: boolean;
      linux: boolean;
    };
    streamingvideo: boolean;
    price?: {
      currency: string;
      initial: number;
      final: number;
    };
    controller_support?: string;
  }>;
}

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
  async validateGameExists(appId: number): Promise<boolean> {
    try {
      const response = await this.retryService.withRetry(() =>
        axios.get<Record<number, SteamAppDetails>>(
          `${this.baseUrl}/api/appdetails`,
          {
            params: { appids: appId },
            headers: { 'User-Agent': 'NestJS-SteamReviewService' },
          },
        ),
      );

      if (!response.data || !response.data[appId]) {
        this.logger.warn(`No data found for app ID ${appId}`);
        return false;
      }

      const appData = response.data[appId];
      if (!appData.success) {
        this.logger.warn(
          `Steam API returned unsuccessful status for app ID ${appId}`,
        );
        return false;
      }

      return appData.data.type === 'game';
    } catch (error) {
      this.logger.error(
        `Error validating game ${appId}:`,
        error instanceof Error ? error.stack : error,
      );
      return false;
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
  async fetchAllReviews(appId: number): Promise<SteamReview[]> {
    const allReviews: SteamReview[] = [];
    let cursor = '*';

    try {
      do {
        this.logger.debug(
          `Fetching reviews for app ${appId} with cursor ${cursor}`,
        );
        const response = await this.retryService.withRetry(() =>
          axios.get<SteamApiResponse>(`${this.baseUrl}/appreviews/${appId}`, {
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

        const reviews = data.reviews || [];
        allReviews.push(...reviews);

        cursor = data.cursor;

        if (reviews.length === 0) {
          break;
        }
      } while (cursor && cursor !== '');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      throw new HttpException(
        `Failed to fetch reviews from Steam: ${errorMessage}`,
        HttpStatus.BAD_GATEWAY,
      );
    }

    return allReviews;
  }
}
