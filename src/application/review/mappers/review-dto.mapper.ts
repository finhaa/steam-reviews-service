import { Review } from '@domain/review/entities/review.entity';
import { ReviewResponseDto } from '../dto/review.dto';

export class ReviewDtoMapper {
  static toDto(review: Review): ReviewResponseDto {
    const dto = new ReviewResponseDto();
    dto.id = review.id;
    dto.steamId = review.steamId;
    dto.gameId = review.gameId;
    dto.authorSteamId = review.authorSteamId || undefined;
    dto.recommended = review.recommended;
    dto.content = review.content;
    dto.timestampCreated = review.timestampCreated;
    dto.timestampUpdated = review.timestampUpdated || undefined;
    dto.deleted = review.deleted;
    dto.createdAt = review.createdAt;
    dto.updatedAt = review.updatedAt;
    return dto;
  }

  static toDtoList(reviews: Review[]): ReviewResponseDto[] {
    return reviews.map((review) => this.toDto(review));
  }
}
