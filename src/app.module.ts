import { Module } from '@nestjs/common';
import { GameModule } from './interfaces/rest/game/game.module';
import { ReviewModule } from './interfaces/rest/review/review.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule, GameModule, ReviewModule],
})
export class AppModule {}
