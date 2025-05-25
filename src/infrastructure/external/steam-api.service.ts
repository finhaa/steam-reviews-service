import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import axios from 'axios';
import { RetryService } from '@infrastructure/services/retry.service';

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

@Injectable()
export class SteamApiService {
  private readonly baseUrl = 'https://store.steampowered.com/appreviews';
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
  async fetchAllReviews(appId: number): Promise<SteamReview[]> {
    const allReviews: SteamReview[] = [];
    let cursor = '*';

    try {
      do {
        console.log('fetchAllReviews', appId, cursor);
        const response = await this.retryService.withRetry(() =>
          axios.get<SteamApiResponse>(`${this.baseUrl}/${appId}`, {
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
        console.log('fetchAllReviews', response.data);

        const data = response.data;

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
