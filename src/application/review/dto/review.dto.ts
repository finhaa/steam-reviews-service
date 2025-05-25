import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Review ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Steam recommendation ID',
    example: '76561198336392081',
  })
  steamId: string;

  @ApiProperty({
    description: 'Game ID',
    example: 570,
  })
  gameId: number;

  @ApiProperty({
    description: 'Steam ID of the review author',
    required: false,
    example: '76561198336392081',
  })
  authorSteamId?: string;

  @ApiProperty({
    description: 'Whether the review is positive',
    example: true,
  })
  recommended: boolean;

  @ApiProperty({
    description: 'Review content',
    example: 'Great game, highly recommended!',
  })
  content: string;

  @ApiProperty({
    description: 'When the review was created on Steam',
    example: '2024-03-25T15:30:00.000Z',
  })
  timestampCreated: Date;

  @ApiProperty({
    description: 'When the review was last updated on Steam',
    required: false,
    example: '2024-03-25T16:45:00.000Z',
  })
  timestampUpdated?: Date;

  @ApiProperty({
    description: 'Whether the review has been deleted',
    example: false,
  })
  deleted: boolean;

  @ApiProperty({
    description: 'When the review was created in our database',
    example: '2024-03-25T15:31:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'When the review was last updated in our database',
    example: '2024-03-25T15:31:00.000Z',
  })
  updatedAt: Date;
}
