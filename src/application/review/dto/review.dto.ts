import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  steamId: string;

  @ApiProperty()
  gameId: number;

  @ApiProperty({ required: false })
  authorSteamId?: string;

  @ApiProperty()
  recommended: boolean;

  @ApiProperty()
  content: string;

  @ApiProperty()
  timestampCreated: Date;

  @ApiProperty({ required: false })
  timestampUpdated?: Date;

  @ApiProperty()
  deleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
