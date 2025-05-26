import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class RegisterGameDto {
  @ApiProperty({
    description: 'The Steam App ID of the game',
    example: 570,
  })
  @IsInt()
  @IsPositive()
  appId: number;
}
