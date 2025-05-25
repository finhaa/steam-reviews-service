import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewPrismaRepository } from './prisma/repositories/review-prisma.repository';
import { GamePrismaRepository } from './prisma/repositories/game-prisma.repository';

@Module({
  imports: [PrismaModule],
  providers: [GamePrismaRepository, ReviewPrismaRepository],
  exports: [GamePrismaRepository, ReviewPrismaRepository],
})
export class DatabaseModule {}
