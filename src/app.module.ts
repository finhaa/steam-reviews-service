import { Module } from '@nestjs/common';
import { RestModule } from './interfaces/rest/rest.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, RestModule],
  exports: [InfrastructureModule],
})
export class AppModule {}
