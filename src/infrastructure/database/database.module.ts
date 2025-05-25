import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/database/prisma/prisma.module';
import { ReviewPrismaRepository } from '@infrastructure/database/prisma/repositories/review-prisma.repository';
import { GamePrismaRepository } from '@infrastructure/database/prisma/repositories/game-prisma.repository';

@Module({
  imports: [PrismaModule],
  providers: [GamePrismaRepository, ReviewPrismaRepository],
  exports: [GamePrismaRepository, ReviewPrismaRepository],
})
export class DatabaseModule {}
