import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { GameModule } from './interfaces/rest/game/game.module';
import { ReviewModule } from './interfaces/rest/review/review.module';
import { performanceConfig } from './infrastructure/config/performance.config';
import { RetryService } from './infrastructure/services/retry.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [performanceConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    DatabaseModule,
    GameModule,
    ReviewModule,
  ],
  providers: [RetryService],
})
export class AppModule {}
