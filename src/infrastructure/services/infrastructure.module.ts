import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RetryService } from './retry.service';

@Module({
  imports: [ConfigModule],
  providers: [RetryService],
  exports: [RetryService],
})
export class InfrastructureModule {} 