import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { RetryService } from './services/retry.service';
import { SteamApiService } from './external/steam-api.service';
import { performanceConfig } from './config/performance.config';

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
    DatabaseModule,
  ],
  providers: [RetryService, SteamApiService],
  exports: [DatabaseModule, RetryService, SteamApiService],
})
export class InfrastructureModule {} 