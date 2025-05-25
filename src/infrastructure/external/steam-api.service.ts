import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios from 'axios';

interface SteamReview {
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

  async fetchAllReviews(appId: number): Promise<SteamReview[]> {
    const allReviews: SteamReview[] = [];
    let cursor = '*';

    try {
      do {
        const response = await axios.get<SteamApiResponse>(
          `${this.baseUrl}/${appId}`,
          {
            params: {
              json: 1,
              filter: 'recent',
              language: 'all',
              cursor: cursor,
              num_per_page: 100,
            },
            headers: { 'User-Agent': 'NestJS-SteamReviewService' },
          },
        );

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
