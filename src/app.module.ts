import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/database/prisma/prisma.module';
import { DatabaseModule } from './infrastructure/database/database.module';
import { GameModule } from './interfaces/rest/game/game.module';
import { ReviewModule } from './interfaces/rest/review/review.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    DatabaseModule,
    GameModule,
    ReviewModule,
  ],
})
export class AppModule {}
