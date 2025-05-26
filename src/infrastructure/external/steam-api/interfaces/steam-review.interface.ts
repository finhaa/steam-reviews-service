export interface SteamReviewAuthor {
  steamid: string;
}

export interface SteamReview {
  recommendationid: string;
  author?: SteamReviewAuthor;
  review: string;
  timestamp_created: number;
  timestamp_updated: number;
  voted_up: boolean;
}

export interface SteamReviewsResponse {
  success: number;
  reviews: SteamReview[];
  cursor: string;
}
