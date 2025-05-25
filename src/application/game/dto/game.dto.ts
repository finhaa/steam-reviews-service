import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterGameDto {
  @ApiProperty({ example: 570 })
  @IsInt()
  appId: number;

  @ApiProperty({ example: 'Dota 2', required: false })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;
}

export class GameResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  appId: number;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
