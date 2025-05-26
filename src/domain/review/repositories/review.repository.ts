import { Review } from '../entities/review.entity';

export interface ReviewRepository {
  findById(id: number): Promise<Review | null>;
  findBySteamId(steamId: string): Promise<Review | null>;
  findByGameId(gameId: number): Promise<Review[]>;
  findByGameIdPaginated(gameId: number, skip: number, take: number): Promise<Review[]>;
  countByGameId(gameId: number): Promise<number>;
  create(review: Review): Promise<Review>;
  update(review: Review): Promise<Review>;
  softDeleteByGameIdNotIn(gameId: number, steamIds: string[]): Promise<void>;
}
